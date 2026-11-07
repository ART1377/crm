// src/features/tasks/components/contact-import-dialog.tsx

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { BookmarkCheck, CheckCircle2, FileText, Loader2, Phone, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { extractPhonesFromText, parseVCardPhones } from '@/lib/phone-utils';
import { LEADS_QUERY_KEY, TASKS_QUERY_KEY } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

interface MatchedLead {
  id: string;
  businessName: string;
  phoneNumber: string;
  contactSaved: boolean;
}

interface BulkCheckResult {
  totalPhones: number;
  uniquePhones: number;
  matchedCount: number;
  alreadySavedCount: number;
  newlySavedCount: number;
  matchedLeads: MatchedLead[];
}

type Stage = 'idle' | 'parsed' | 'loading' | 'done';

export function ContactImportDialog() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [phones, setPhones] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<BulkCheckResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const reset = () => {
    setStage('idle');
    setPhones([]);
    setFileName('');
    setResult(null);
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم فایل بیشتر از ۱۰ مگابایت است');
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();

      // تلاش اول: vCard
      let extracted = parseVCardPhones(text);

      // اگر vCard خالی بود، به‌عنوان متن آزاد امتحان کن
      if (extracted.length === 0) {
        extracted = extractPhonesFromText(text);
      }

      if (extracted.length === 0) {
        toast.error('هیچ شماره‌ای در فایل پیدا نشد');
        setStage('idle');
        return;
      }

      setPhones(extracted);
      setStage('parsed');
      toast.success(`${extracted.length} شماره از فایل استخراج شد`);
    } catch {
      toast.error('خطا در خواندن فایل');
      setStage('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleApply = async () => {
    if (phones.length === 0) return;
    setStage('loading');

    try {
      const res = await fetch('/api/leads/bulk-check-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, apply: true }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'خطا در بررسی');
      }

      const data: BulkCheckResult = await res.json();
      setResult(data);
      setStage('done');

      // refresh queries
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });

      if (data.matchedCount === 0) {
        toast('هیچ سرنخی با این شماره‌ها پیدا نشد', { icon: 'ℹ️' });
      } else if (data.newlySavedCount > 0) {
        toast.success(
          `${data.newlySavedCount} سرنخ جدید علامت‌گذاری شد (${data.alreadySavedCount} از قبل بودند)`
        );
      } else {
        toast(`همه ${data.alreadySavedCount} سرنخ از قبل علامت‌گذاری شده بودند`, {
          icon: '✅',
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در بررسی');
      setStage('parsed');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          بررسی مخاطبین گوشی
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] max-w-md flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base font-bold">بررسی مخاطبین گوشی</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-1">
          {/* توضیح */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            فایل مخاطبین گوشی (`.vcf`) را آپلود کنید تا مشخص شود کدام سرنخ‌ها از قبل در گوشی شما
            ذخیره شده‌اند.
          </div>

          {/* Stage: idle → drop zone */}
          {stage === 'idle' && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                )}
              >
                <Upload
                  className={cn('h-8 w-8', dragging ? 'text-primary' : 'text-muted-foreground')}
                />
                <p className="text-sm font-medium">فایل vCard را اینجا رها کنید</p>
                <p className="text-muted-foreground text-xs">یا کلیک کنید تا انتخاب شود</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.vcard,text/vcard,text/x-vcard,*/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
            </>
          )}

          {/* Stage: parsed → preview */}
          {stage === 'parsed' && (
            <>
              <div className="bg-muted/30 flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="truncate text-xs" title={fileName}>
                    {fileName}
                  </span>
                </div>
                <span className="text-primary shrink-0 text-xs font-medium">
                  {phones.length} شماره
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  className="flex-1 gap-2"
                  disabled={phones.length === 0}
                >
                  <BookmarkCheck className="h-4 w-4" />
                  بررسی و علامت‌گذاری
                </Button>
                <Button variant="outline" size="icon" onClick={reset} title="فایل جدید">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Stage: loading */}
          {stage === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">در حال بررسی...</p>
            </div>
          )}

          {/* Stage: done → results */}
          {stage === 'done' && result && (
            <>
              {/* آمار */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px]">شماره‌های یکتا</p>
                  <p className="text-lg font-bold">{result.uniquePhones}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-primary/80 text-[10px]">سرنخ پیدا شد</p>
                  <p className="text-primary text-lg font-bold">{result.matchedCount}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-[10px] text-emerald-700">جدید علامت‌گذاری شد</p>
                  <p className="text-lg font-bold text-emerald-600">{result.newlySavedCount}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-[10px] text-amber-700">از قبل بودند</p>
                  <p className="text-lg font-bold text-amber-600">{result.alreadySavedCount}</p>
                </div>
              </div>

              {/* لیست سرنخ‌های پیدا‌شده */}
              {result.matchedLeads.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    سرنخ‌های پیدا‌شده (پیش‌نمایش {result.matchedLeads.length} مورد):
                  </p>
                  <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                    {result.matchedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="hover:bg-muted/30 flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {lead.businessName}
                        </span>
                        <span
                          className="text-muted-foreground flex shrink-0 items-center gap-1 text-[10px]"
                          dir="ltr"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          {lead.phoneNumber}
                        </span>
                        {lead.contactSaved && (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={reset} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                آپلود فایل دیگر
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

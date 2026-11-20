// src/features/tasks/components/contact-import-dialog.tsx

'use client';

import { useState } from 'react';

import { BookmarkCheck, CheckCircle2, FileText, Loader2, Phone, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useContactImport } from '../hooks/use-contact-import';

import { cn } from '@/lib/utils';

export function ContactImportDialog() {
  const [open, setOpen] = useState(false);

  const {
    stage,
    phones,
    fileName,
    result,
    dragging,
    fileInputRef,
    reset,
    openFilePicker,
    handleFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleApply,
    isApplying,
  } = useContactImport();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFilePicker}
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

              <Input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.vcard,text/vcard,text/x-vcard,*/*"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
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
                  disabled={phones.length === 0 || isApplying}
                >
                  {isApplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookmarkCheck className="h-4 w-4" />
                  )}
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

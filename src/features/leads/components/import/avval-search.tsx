// src/features/leads/components/import/avval-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSaveAvvalHistory } from '@/features/leads/hooks/use-avval-history';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { useRangeSelection } from '@/hooks/use-range-selection';
import { Download, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { AvvalHistory } from './avval-history';
import { ImportToolbar } from './import-toolbar';
import { ResultCard } from './result-card';
import { scrapeAvval } from './services/avval.service';

export function AvvalSearch() {
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [savingOne, setSavingOne] = useState<string | null>(null);
  const [importingOne, setImportingOne] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);

  // ✅ دریافت صنایع از بک‌اند
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');

  // ✅ ثبت تاریخچه
  const saveHistory = useSaveAvvalHistory();

  // ✅ فیلترها
  const filteredPlaces = useMemo(
    () =>
      places.filter((p) => {
        if (!showDuplicates && p.isExisting) return false;
        if (!showHidden && hiddenIds.has(p.id)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.businessName.toLowerCase().includes(q) ||
            p.phoneNumber.includes(q) ||
            p.address?.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [places, showDuplicates, hiddenIds, showHidden, searchQuery]
  );

  // ✅ انتخاب بازه‌ای با Shift+Click
  const { selected, toggleWithRange, selectAll, clearSelection, setSelected } =
    useRangeSelection(filteredPlaces);

  const handleFetch = async () => {
    if (!slug.trim()) {
      toast.error('اسلاگ دسته را وارد کنید (مثلاً میلگرد-صنعتی)');
      return;
    }
    if (!industry) {
      toast.error('یک صنعت برای ذخیره انتخاب کنید');
      return;
    }

    setLoading(true);
    setPlaces([]);
    clearSelection();
    setHiddenIds(new Set());

    try {
      const result = await scrapeAvval({ slug: slug.trim(), industry });
      setPlaces(result.places);

      // ✅ ثبت در تاریخچه (فقط اگر نتیجه داشت)
      if (result.total > 0) {
        saveHistory.mutate({
          slug: slug.trim(),
          industry,
          count: result.total,
          pages: result.pagesScraped,
        });
      }

      if (result.total === 0) {
        toast.error('هیچ شرکتی پیدا نشد — اسلاگ را بررسی کنید');
      } else {
        toast.success(`${result.total} شرکت از ${result.pagesScraped} صفحه دریافت شد`);
        if (result.hasMore) {
          toast('⚠️ صفحه سوم به بعد پولی است و دریافت نشد', { duration: 5000 });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // ✅ انتخاب از تاریخچه
  const handleSelectFromHistory = (selectedSlug: string, selectedIndustry: string) => {
    setSlug(selectedSlug);
    setIndustry(selectedIndustry);
    toast.success('از تاریخچه بارگذاری شد');
  };

  const handleHide = (id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const handleShowAllHidden = () => {
    setHiddenIds(new Set());
    setShowHidden(false);
  };

  const handleSaveOneToStaging = async (place: any) => {
    setSavingOne(place.id);
    try {
      const res = await fetch('/api/leads/staged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: [
            {
              ...place,
              source: 'کتاب اول',
              industry,
              category: industry,
            },
          ],
        }),
      });
      const r = await res.json();
      if (r.added > 0) {
        toast.success('به انبار ذخیره شد');
        setPlaces((prev) => prev.filter((p) => p.id !== place.id));
      } else {
        toast.error('قبلاً ذخیره شده');
      }
    } catch {
      toast.error('خطا در ذخیره');
    } finally {
      setSavingOne(null);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>کتاب اول (avval.ir)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️ فقط ۲ صفحه اول (حدود ۵۰ شرکت) قابل دریافت است. صفحه ۳ به بعد پولی است.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="avval-slug">اسلاگ دسته (از URL)</Label>
              <Input
                id="avval-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="مثلاً: میلگرد-صنعتی"
                dir="ltr"
              />
              <p className="text-muted-foreground text-[10px]">
                بخش آخر URL avval (بعد از /directory/ یا /search/)
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avval-industry">صنعت برای ذخیره</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="avval-industry" className="w-full">
                  <SelectValue placeholder="انتخاب صنعت..." />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-[10px]">
                با این نام در دیتابیس ذخیره می‌شود
              </p>
            </div>
          </div>

          <Button onClick={handleFetch} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading ? 'در حال دریافت...' : 'دریافت ۵۰ شرکت'}
          </Button>
        </CardContent>
      </Card>

      {/* ✅ تاریخچه جستجوها */}
      <AvvalHistory onSelect={handleSelectFromHistory} />

      {places.length > 0 && (
        <Card>
          <CardHeader>
            <ImportToolbar
              places={filteredPlaces}
              selected={selected}
              importing={importing}
              hiddenCount={hiddenIds.size}
              onToggleAll={selectAll}
              onImport={async () => {
                if (selected.size === 0) return;
                setImporting(true);
                try {
                  const leads = places
                    .filter((p) => selected.has(p.id))
                    .map((p) => ({
                      ...p,
                      source: 'کتاب اول',
                      industry,
                      category: industry,
                    }));
                  const res = await fetch('/api/leads/bulk-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leads }),
                  });
                  const r = await res.json();
                  toast.success(`${r.imported} وارد شد`);
                  setPlaces((prev) =>
                    prev.map((p) => (selected.has(p.id) ? { ...p, isExisting: true } : p))
                  );
                  clearSelection();
                } catch {
                  toast.error('خطا در وارد کردن');
                } finally {
                  setImporting(false);
                }
              }}
              onSearchChange={setSearchQuery}
              onToggleDuplicates={setShowDuplicates}
              onShowHidden={handleShowAllHidden}
              showDuplicates={showDuplicates}
              showHidden={showHidden}
              searchQuery={searchQuery}
              onSaveToStaging={async () => {
                if (selected.size === 0) return;
                setSavingBulk(true);
                try {
                  const leads = places
                    .filter((p) => selected.has(p.id))
                    .map((p) => ({
                      ...p,
                      source: 'کتاب اول',
                      industry,
                      category: industry,
                    }));
                  const res = await fetch('/api/leads/staged', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leads }),
                  });
                  const r = await res.json();
                  toast.success(`${r.added} به انبار ذخیره شد`);
                  setPlaces((prev) => prev.filter((p) => !selected.has(p.id)));
                  clearSelection();
                } catch {
                  toast.error('خطا');
                } finally {
                  setSavingBulk(false);
                }
              }}
              saving={savingBulk}
            />
          </CardHeader>
          <CardContent>
            <div className="max-h-140 space-y-2 overflow-y-auto">
              {filteredPlaces.map((place, index) => (
                <ResultCard
                  key={place.id}
                  place={place}
                  checked={selected.has(place.id)}
                  index={index}
                  total={filteredPlaces.length}
                  importing={importingOne === place.id}
                  isHidden={hiddenIds.has(place.id)}
                  onCheckedChange={(e) => toggleWithRange(place.id, e)}
                  onSave={(id, p) => setPlaces((prev) => prev.map((x) => (x.id === id ? p : x)))}
                  onImportOne={async (p) => {
                    setImportingOne(p.id);
                    try {
                      const res = await fetch('/api/leads/bulk-import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          leads: [
                            {
                              ...p,
                              source: 'کتاب اول',
                              industry,
                              category: industry,
                            },
                          ],
                        }),
                      });
                      const r = await res.json();
                      toast.success(`${r.imported} وارد شد`);
                      setPlaces((prev) =>
                        prev.map((x) => (x.id === p.id ? { ...x, isExisting: true } : x))
                      );
                    } catch {
                      toast.error('خطا');
                    } finally {
                      setImportingOne(null);
                    }
                  }}
                  onHide={handleHide}
                  savingOne={savingOne === place.id}
                  onSaveOneToStaging={handleSaveOneToStaging}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

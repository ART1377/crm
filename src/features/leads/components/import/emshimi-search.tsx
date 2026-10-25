// src/features/leads/components/import/emshimi-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useImportSearch } from './hooks/use-import-search';
import { ImportToolbar } from './import-toolbar';
import { ResultCard } from './result-card';

interface EmshimiSearchProps {
  selectedIndustries?: string[];
}

export function EmshimiSearch({ selectedIndustries = [] }: EmshimiSearchProps) {
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [maxPages, setMaxPages] = useState('50');
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    places,
    setPlaces,
    selected,
    setSelected,
    filteredPlaces,
    importing,
    importingOne,
    showDuplicates,
    setShowDuplicates,
    searchQuery,
    setSearchQuery,
    hiddenIds,
    showHidden,
    toggle,
    toggleAll,
    handleHide,
    handleShowAllHidden,
    handleImport,
    handleImportOne,
    updatePlace,
    saving,
    handleSaveToStaging,
    savingOne,
    handleSaveOneToStaging,
  } = useImportSearch({
    searchFn: async () => ({ places: [], total: 0 }),
    sharedParams: {
      keyword: 'شیمیایی',
      latitude: '',
      longitude: '',
      radius: '',
    },
    sourceName: 'اتحادیه شیمیایی',
    selectedIndustries: ['شیمیایی'],
  });

  const handleSearchWithProgress = async () => {
    setLoading(true);
    setPlaces([]);
    setSelected(new Set());
    setProgress('در حال شروع...');
    setProgressPercent(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({ maxPages });
      const res = await fetch(`/api/leads/search-emshimi?${params}`, {
        signal: controller.signal,
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      const seenIds = new Set<string>();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === 'progress') {
              setProgress(data.message);
              if (data.total > 0) {
                setProgressPercent(Math.round((data.current / data.total) * 100));
              }
            } else if (data.type === 'place') {
              if (!seenIds.has(data.place.id)) {
                seenIds.add(data.place.id);
                setPlaces((prev) => [...prev, data.place]);
              }
            } else if (data.type === 'done') {
              setProgress(`${data.total} سرنخ پیدا شد`);
              setProgressPercent(100);
              toast.success(`جستجو کامل شد - ${data.total} سرنخ`);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.success('جستجو متوقف شد');
      } else {
        toast.error('خطا در جستجو');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>جستجو در اتحادیه شیمیایی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{progress}</p>
                <span className="text-xs font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">حداکثر تعداد صفحات</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              className="h-10 rounded-xl"
            />
            <p className="text-muted-foreground text-[10px]">
              هر صفحه ۲۵ سرنخ دارد. برای دریافت همه، ۱۰۰ بگذارید.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {!loading ? (
              <Button className="w-full gap-2 sm:flex-1" onClick={handleSearchWithProgress}>
                <Search className="h-4 w-4" /> جستجو
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full gap-2 sm:flex-1"
                onClick={handleCancel}
              >
                <Square className="h-4 w-4" /> توقف
              </Button>
            )}
            {places.length > 0 && (
              <Button
                variant="outline"
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="w-full sm:w-auto"
              >
                ایمپورت ({places.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {places.length > 0 && (
        <Card>
          <CardHeader>
            <ImportToolbar
              places={filteredPlaces}
              selected={selected}
              importing={importing}
              hiddenCount={hiddenIds.size}
              onToggleAll={toggleAll}
              onImport={handleImport}
              onSearchChange={setSearchQuery}
              onToggleDuplicates={setShowDuplicates}
              onShowHidden={handleShowAllHidden}
              showDuplicates={showDuplicates}
              showHidden={showHidden}
              searchQuery={searchQuery}
              onSaveToStaging={handleSaveToStaging}
              saving={saving}
            />
          </CardHeader>
          <CardContent>
            <div className="max-h-120 space-y-2 overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {searchQuery ? 'نتیجه‌ای پیدا نشد' : 'هیچ نتیجه‌ای وجود ندارد'}
                </div>
              ) : (
                filteredPlaces.map((place, index) => (
                  <ResultCard
                    key={place.id}
                    place={place}
                    checked={selected.has(place.id)}
                    index={index}
                    total={filteredPlaces.length}
                    importing={importingOne === place.id}
                    isHidden={hiddenIds.has(place.id)}
                    onCheckedChange={() => toggle(place.id)}
                    onSave={updatePlace}
                    onImportOne={handleImportOne}
                    onHide={handleHide}
                    savingOne={savingOne === place.id}
                    onSaveOneToStaging={handleSaveOneToStaging}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && places.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">در حال استخراج...</p>
              <p className="text-muted-foreground text-xs">{progress}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

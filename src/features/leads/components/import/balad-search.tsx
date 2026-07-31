// src/features/leads/components/import/balad-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, MapPin, Pause, Play, Search, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useImportSearch } from './hooks/use-import-search';
import { ImportToolbar } from './import-toolbar';
import { ResultCard } from './result-card';
import { SearchMap } from './search-map';
import { generateGridPoints } from './services/balad.service';

interface BaladSearchProps {
  sharedParams: {
    keyword: string;
    latitude: string;
    longitude: string;
    radius: string;
    zoom: string;
    step: string;
  };
}

export function BaladSearch({ sharedParams }: BaladSearchProps) {
  const [showMap, setShowMap] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [gridPoints, setGridPoints] = useState<
    Array<{ lat: number; lng: number; searched: boolean }>
  >([]);
  const [currentPoint, setCurrentPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [paused, setPaused] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);
  const resumeRef = useRef<() => void>(() => {});

  const {
    loading,
    setLoading,
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
  } = useImportSearch({
    searchFn: async ({ keyword, lat, lng, radius }) => {
      const params = new URLSearchParams({
        keyword,
        lat,
        lng,
        radius,
        step: sharedParams.step,
      });
      const res = await fetch(`/api/leads/search-balad?${params}`);
      return res.json();
    },
    sharedParams,
    sourceName: 'بلد',
  });

  const handleSearchWithProgress = async () => {
    // تنظیمات اولیه
    setLoading(true);
    setPaused(false);
    pauseRef.current = false;
    setPlaces([]);
    setSelected(new Set());
    setProgress('در حال شروع...');
    setProgressPercent(0);

    // تولید نقاط شبکه
    try {
      const points = generateGridPoints(
        parseFloat(sharedParams.latitude),
        parseFloat(sharedParams.longitude),
        parseFloat(sharedParams.radius),
        parseFloat(sharedParams.step)
      );
      setGridPoints(points.map((p) => ({ ...p, searched: false })));
    } catch {}

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({
        keyword: sharedParams.keyword,
        lat: sharedParams.latitude,
        lng: sharedParams.longitude,
        radius: sharedParams.radius,
        step: sharedParams.step,
      });

      const res = await fetch(`/api/leads/search-balad?${params}`, { signal: controller.signal });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      const seenIds = new Set<string>();

      while (true) {
        // بررسی توقف موقت
        if (pauseRef.current) {
          await new Promise<void>((resolve) => {
            resumeRef.current = resolve;
          });
        }

        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === 'progress') {
              // به‌روزرسانی پیشرفت
              setProgress(data.message);
              if (data.total > 0) {
                setProgressPercent(Math.round((data.current / data.total) * 100));
              }
              if (data.point) {
                setCurrentPoint(data.point);
                setGridPoints((prev) =>
                  prev.map((p) =>
                    p.lat === data.point.lat && p.lng === data.point.lng
                      ? { ...p, searched: true }
                      : p
                  )
                );
              }
            } else if (data.type === 'place') {
              // افزودن مکان جدید
              if (!seenIds.has(data.place.id)) {
                seenIds.add(data.place.id);
                setPlaces((prev) => [...prev, data.place]);
              }
            } else if (data.type === 'done') {
              // پایان جستجو
              setProgress(`${data.total} سرنخ پیدا شد`);
              setProgressPercent(100);
              setCurrentPoint(null);
              toast.success(`جستجو کامل شد - ${data.total} سرنخ`);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.success('جستجو متوقف شد');
      } else {
        toast.error('خطا در جستجو');
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
      setPaused(false);
      setCurrentPoint(null);
      abortControllerRef.current = null;
    }
  };

  // توابع کنترل توقف و ادامه
  const handlePause = () => {
    setPaused(true);
    pauseRef.current = true;
    toast('جستجو متوقف شد', { icon: '⏸' });
  };

  const handleResume = () => {
    setPaused(false);
    pauseRef.current = false;
    resumeRef.current();
    toast.success('جستجو ادامه یافت');
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>جستجو در بلد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{progress}</p>
                <span className="text-xs font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* دکمه‌های کنترل */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!loading ? (
              <Button
                className="w-full gap-2 sm:w-auto sm:flex-1"
                onClick={handleSearchWithProgress}
              >
                <Search className="h-4 w-4" /> جستجو
              </Button>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto sm:flex-1">
                {!paused ? (
                  <Button variant="outline" className="flex-1 gap-2" onClick={handlePause}>
                    <Pause className="h-4 w-4" /> توقف موقت
                  </Button>
                ) : (
                  <Button variant="default" className="flex-1 gap-2" onClick={handleResume}>
                    <Play className="h-4 w-4" /> ادامه
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="shrink-0"
                  onClick={handleCancel}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-2 sm:shrink-0">
              {places.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                  className="flex-1"
                >
                  ایمپورت ({places.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex-1"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? 'مخفی کردن نقشه' : 'نمایش نقشه'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نقشه + نتایج */}
      {showMap && loading && gridPoints.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="order-1 h-80 lg:sticky lg:top-4 lg:order-2 lg:h-[calc(100vh-12rem)]">
            <SearchMap
              center={{
                lat: parseFloat(sharedParams.latitude),
                lng: parseFloat(sharedParams.longitude),
              }}
              gridPoints={gridPoints}
              currentPoint={currentPoint}
              zoom={parseInt(sharedParams.zoom)}
            />
          </div>

          <div className="order-2 lg:order-1">
            {places.length === 0 ? (
              <Card className="h-full">
                <CardContent className="flex h-full min-h-80 items-center justify-center py-8 lg:min-h-[calc(100vh-12rem)]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground text-sm">در حال جستجو...</p>
                    <p className="text-muted-foreground text-xs">{progress}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
                  />
                </CardHeader>
                <CardContent>
                  <div className="max-h-140 space-y-2 overflow-y-auto">
                    {filteredPlaces.length === 0 ? (
                      <div className="text-muted-foreground py-8 text-center text-sm">
                        {searchQuery ? 'نتیجه‌ای با این عبارت پیدا نشد' : 'هیچ نتیجه‌ای وجود ندارد'}
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
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* حالت لودینگ بدون نقشه */}
          {loading && places.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground text-sm">در حال جستجو...</p>
                  <p className="text-muted-foreground text-xs">{progress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* نتایج بدون نقشه */}
          {places.length > 0 && !showMap && (
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
                />
              </CardHeader>
              <CardContent>
                <div className="max-h-120 space-y-2 overflow-y-auto">
                  {filteredPlaces.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      {searchQuery ? 'نتیجه‌ای با این عبارت پیدا نشد' : 'هیچ نتیجه‌ای وجود ندارد'}
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
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

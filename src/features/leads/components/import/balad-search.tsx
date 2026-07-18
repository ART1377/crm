// src/features/leads/components/import/balad-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { Loader2, MapPin, Pause, Play, Search, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImportToolbar } from './import-toolbar';
import { generateSearchKeywords } from './keywords/generator';
import { ResultCard } from './result-card';
import { SearchConfig } from './search-config';
import { SearchMap } from './search-map';
import { generateGridPoints } from './services/balad.service';
import type { BaladPlace } from './types';

export function BaladSearch() {
  const { data: industries = [] } = useListOptions('INDUSTRY');
  const [keyword, setKeyword] = useState('');
  const [latitude, setLatitude] = useState('35.6607');
  const [longitude, setLongitude] = useState('51.3156');
  const [radius, setRadius] = useState('2');
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [places, setPlaces] = useState<BaladPlace[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importingOne, setImportingOne] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [gridPoints, setGridPoints] = useState<
    Array<{ lat: number; lng: number; searched: boolean }>
  >([]);
  const [currentPoint, setCurrentPoint] = useState<{ lat: number; lng: number } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);
  const resumeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!keyword && industries.length > 0) {
      const first = industries[0].value.replace(/\u200C/g, ' ').trim();
      const aliases = generateSearchKeywords({ keyword: first });
      setKeyword(aliases.join(', '));
    }
  }, [industries, keyword]);

  useEffect(() => {
    try {
      const points = generateGridPoints(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      setGridPoints(points.map((p) => ({ ...p, searched: false })));
    } catch {}
  }, [latitude, longitude, radius]);

  async function handleSearch() {
    setLoading(true);
    setPaused(false);
    pauseRef.current = false;
    setPlaces([]);
    setSelected(new Set());
    setProgress('در حال شروع...');
    setProgressPercent(0);
    try {
      const points = generateGridPoints(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
      setGridPoints(points.map((p) => ({ ...p, searched: false })));
    } catch {}

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({ keyword, lat: latitude, lng: longitude, radius });
      const res = await fetch(`/api/leads/search-balad?${params}`, { signal: controller.signal });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      const seenIds = new Set<string>();

      while (true) {
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
              setProgress(data.message);
              if (data.total > 0) setProgressPercent(Math.round((data.current / data.total) * 100));
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
              if (!seenIds.has(data.place.id)) {
                seenIds.add(data.place.id);
                setPlaces((prev) => [...prev, data.place]);
              }
            } else if (data.type === 'done') {
              setProgress(`${data.total} سرنخ پیدا شد`);
              setProgressPercent(100);
              setCurrentPoint(null);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.success('جستجو متوقف شد');
      } else {
        toast.error('خطا در جستجو');
      }
    } finally {
      setLoading(false);
      setPaused(false);
      setCurrentPoint(null);
      abortControllerRef.current = null;
    }
  }

  function handlePause() {
    setPaused(true);
    pauseRef.current = true;
    toast('جستجو متوقف شد', { icon: '⏸' });
  }
  function handleResume() {
    setPaused(false);
    pauseRef.current = false;
    resumeRef.current();
    toast.success('جستجو ادامه یافت');
  }
  function handleCancel() {
    abortControllerRef.current?.abort();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAll() {
    const av = places.filter((p) => !p.isExisting);
    setSelected(selected.size === av.length ? new Set() : new Set(av.map((p) => p.id)));
  }

  async function importPlaces(ids: string[]) {
    const leads = places
      .filter((p) => ids.includes(p.id))
      .map((p) => ({ ...p, industry: keyword.split(',')[0], source: 'بلد' }));
    const res = await fetch('/api/leads/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads }),
    });
    const r = await res.json();
    toast.success(`${r.imported} وارد شد`);
    setPlaces((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, isExisting: true } : p)));
    setSelected(new Set());
  }

  async function handleImport() {
    setImporting(true);
    await importPlaces(Array.from(selected));
    setImporting(false);
  }
  async function handleImportOne(place: BaladPlace) {
    setImportingOne(place.id);
    await importPlaces([place.id]);
    setImportingOne(null);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>جستجو در بلد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SearchConfig
            keyword={keyword}
            latitude={latitude}
            longitude={longitude}
            radius={radius}
            onKeywordChange={setKeyword}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onRadiusChange={setRadius}
          />

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{progress}</p>
                <span className="text-xs font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!loading ? (
              <Button className="w-full gap-2 sm:w-auto sm:flex-1" onClick={handleSearch}>
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
                  disabled={importing}
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

      {/* Main content area with map */}
      {showMap && loading && gridPoints.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Mobile: Map first, Desktop: Map right (order-2 lg:order-2) */}
          <div className="order-1 h-80 lg:sticky lg:top-4 lg:order-2 lg:h-[calc(100vh-12rem)]">
            <SearchMap
              center={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
              gridPoints={gridPoints}
              currentPoint={currentPoint}
            />
          </div>

          {/* Mobile: Results second, Desktop: Results left (order-2 lg:order-1) */}
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
                    places={places}
                    selected={selected}
                    importing={importing}
                    onToggleAll={toggleAll}
                    onImport={handleImport}
                    onImportOne={handleImportOne}
                  />
                </CardHeader>
                <CardContent>
                  <div className="max-h-140 space-y-2 overflow-y-auto">
                    {places.map((place, index) => (
                      <ResultCard
                        key={place.id}
                        place={place}
                        checked={selected.has(place.id)}
                        index={index}
                        total={places.length}
                        importing={importingOne === place.id}
                        onCheckedChange={() => toggle(place.id)}
                        onSave={(id, updated) =>
                          setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
                        }
                        onImportOne={handleImportOne}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* No map: just show results or loading */}
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

          {places.length > 0 && (
            <Card>
              <CardHeader>
                <ImportToolbar
                  places={places}
                  selected={selected}
                  importing={importing}
                  onToggleAll={toggleAll}
                  onImport={handleImport}
                  onImportOne={handleImportOne}
                />
              </CardHeader>
              <CardContent>
                <div className="max-h-120 space-y-2 overflow-y-auto">
                  {places.map((place, index) => (
                    <ResultCard
                      key={place.id}
                      place={place}
                      checked={selected.has(place.id)}
                      index={index}
                      total={places.length}
                      importing={importingOne === place.id}
                      onCheckedChange={() => toggle(place.id)}
                      onSave={(id, updated) =>
                        setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
                      }
                      onImportOne={handleImportOne}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

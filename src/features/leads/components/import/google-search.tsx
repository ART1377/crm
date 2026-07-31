// src/features/leads/components/import/google-search.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ImportToolbar } from './import-toolbar';
import { generateSearchKeywords } from './keywords/generator';
import { ResultCard } from './result-card';
import { SearchConfig } from './search-config';
import type { BaladPlace } from './types';

export function GoogleSearch() {
  const { data: industries = [] } = useListOptions('INDUSTRY');
  const [keyword, setKeyword] = useState('');
  const [latitude, setLatitude] = useState('35.6892');
  const [longitude, setLongitude] = useState('51.3890');
  const [radius, setRadius] = useState('5000');
  const [zoom, setZoom] = useState('19');
  const [step, setStep] = useState('0.2');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<BaladPlace[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importingOne, setImportingOne] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const filteredPlaces = useMemo(() => {
    let result = places;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(query) ||
          p.phoneNumber.includes(query) ||
          p.address?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    if (!showDuplicates) {
      result = result.filter((p) => !p.isExisting);
    }

    if (!showHidden) {
      result = result.filter((p) => !hiddenIds.has(p.id));
    }

    return result;
  }, [places, searchQuery, showDuplicates, hiddenIds, showHidden]);

  useEffect(() => {
    if (!keyword && industries.length > 0) {
      const first = industries[0].value.replace(/\u200C/g, ' ').trim();
      const aliases = generateSearchKeywords({ keyword: first });
      setKeyword(aliases.join(', '));
    }
  }, [industries, keyword]);

  const handleHide = (id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    if (selected.has(id)) {
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  const handleShowAllHidden = () => {
    setHiddenIds(new Set());
    setShowHidden(false);
  };

  async function handleSearch() {
    setLoading(true);
    try {
      const radiusMeters = parseFloat(radius) * 1000;
      const params = new URLSearchParams({
        keyword,
        lat: latitude,
        lng: longitude,
        radius: radiusMeters.toString(),
      });
      const res = await fetch(`/api/leads/search-google?${params}`);
      const data = await res.json();
      setPlaces(data.places ?? []);
      setSelected(new Set());
      if (data.error) toast.error(data.error);
    } catch {
      toast.error('خطا');
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleAll() {
    const av = filteredPlaces.filter((p) => !p.isExisting);
    setSelected(selected.size === av.length ? new Set() : new Set(av.map((p) => p.id)));
  }

  async function importPlaces(ids: string[]) {
    const leads = places
      .filter((p) => ids.includes(p.id))
      .map((p) => ({ ...p, industry: keyword.split(',')[0], source: 'گوگل مپ' }));
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
          <CardTitle>جستجو در Google Maps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SearchConfig
            keyword={keyword}
            latitude={latitude}
            longitude={longitude}
            radius={radius}
            zoom={zoom}
            step={step}
            onKeywordChange={setKeyword}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onRadiusChange={setRadius}
            onZoomChange={setZoom}
            onStepChange={setStep}
          />
          <Button className="w-full gap-2" onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}{' '}
            جستجو
          </Button>
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
                    onSave={(id, updated) =>
                      setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)))
                    }
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
  );
}

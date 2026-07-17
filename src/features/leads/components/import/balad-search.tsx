'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImportToolbar } from './import-toolbar';
import { generateSearchKeywords } from './keywords/generator';
import { ResultCard } from './result-card';
import { SearchConfig } from './search-config';
import type { BaladPlace } from './types';

export function BaladSearch() {
  const { data: industries = [] } = useListOptions('INDUSTRY');
  const [keyword, setKeyword] = useState('');
  const [latitude, setLatitude] = useState('35.6607');
  const [longitude, setLongitude] = useState('51.3156');
  const [radius, setRadius] = useState('2');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<BaladPlace[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importingOne, setImportingOne] = useState<string | null>(null);

  // Set default keyword from first industry
  useEffect(() => {
    if (!keyword && industries.length > 0) {
      const first = industries[0].value.replace(/\u200C/g, ' ').trim();
      const aliases = generateSearchKeywords({ keyword: first });
      setKeyword(aliases.join(', '));
    }
  }, [industries, keyword]);

  async function handleSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ keyword, lat: latitude, lng: longitude, radius });
      const res = await fetch(`/api/leads/search-balad?${params}`);
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
    </div>
  );
}

'use client';

import { Loader2, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { INDUSTRY_KEYWORDS } from '../../constants/import-keywords';
import { EditPlaceDialog } from './edit-place-dialog';
import { ResultsMap } from './results-map';
import { SearchConfig } from './search-config';

interface Place {
  businessName: string;
  phoneNumber: string;
  address: string;
  rating: number | null;
  location?: { lat: number; lng: number };
  isExisting?: boolean;
  [key: string]: unknown;
}

export function PlacesSearch() {
  const [industry, setIndustry] = useState('آهن‌آلات');
  const [keywords, setKeywords] = useState(INDUSTRY_KEYWORDS['آهن‌آلات']);
  const [latitude, setLatitude] = useState('35.6328');
  const [longitude, setLongitude] = useState('51.3072');
  const [radius, setRadius] = useState('10000');
  const [count, setCount] = useState('15');

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<Array<{
    name: string;
    status: string;
    reason?: string;
  }> | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setImportResults(null);
    try {
      const params = new URLSearchParams({
        industry,
        keywords,
        lat: latitude,
        lng: longitude,
        radius,
        count,
      });
      const res = await fetch(`/api/leads/search-places?${params}`);
      const data = await res.json();
      setPlaces(data.places || []);
      setSelected(new Set());
    } catch {
      toast.error('خطا در جستجو');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selected);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === places.filter((p) => !p.isExisting).length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(places.map((_, i) => i).filter((i) => !places[i].isExisting)));
    }
  };

  const handleEditPlace = (index: number, updatedPlace: Record<string, unknown>) => {
    setPlaces((prev) => {
      const next = [...prev];
      next[index] = updatedPlace as unknown as Place;
      return next;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = Array.from(selected).map((i) => ({
      ...places[i],
      industry,
      source: 'گوگل مپ',
    }));

    try {
      const res = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toImport }),
      });
      const results = await res.json();
      setImportResults(results.details);
      toast.success(`${results.imported} سرنخ وارد شد (${results.skipped} تکراری)`);
    } catch {
      toast.error('خطا در وارد کردن');
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-red-500" />
            پیکربندی جستجو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchConfig
              industry={industry}
              keywords={keywords}
              latitude={latitude}
              longitude={longitude}
              radius={radius}
              onIndustryChange={(v) => {
                setIndustry(v);
                setKeywords(INDUSTRY_KEYWORDS[v] || v);
              }}
              onKeywordsChange={setKeywords}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              onRadiusChange={setRadius}
            />

            <div className="flex items-end gap-3">
              <div className="w-32 space-y-2">
                <label className="text-muted-foreground text-xs">تعداد نتایج</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="border-input bg-background ring-offset-background w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="5">۵ تا</option>
                  <option value="10">۱۰ تا</option>
                  <option value="15">۱۵ تا</option>
                  <option value="20">۲۰ تا</option>
                </select>
              </div>
              <Button onClick={handleSearch} disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="mr-2">جستجو</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {places.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* نتایج */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  نتایج جستجو ({places.length} مورد)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox
                      checked={selectedCount === places.filter((p) => !p.isExisting).length}
                      onCheckedChange={toggleAll}
                    />
                    همه
                  </label>
                  <Button
                    size="sm"
                    onClick={handleImport}
                    disabled={selectedCount === 0 || importing}
                  >
                    <Plus className="ml-2 h-3 w-3" />
                    {importing ? 'در حال وارد کردن...' : `وارد کردن (${selectedCount})`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {importResults && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {importResults.map((r, i) => (
                    <Badge
                      key={i}
                      variant={
                        r.status === 'imported'
                          ? 'default'
                          : r.status === 'skipped'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {r.name}:{' '}
                      {r.status === 'imported' ? '✓' : r.status === 'skipped' ? 'تکراری' : 'خطا'}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="max-h-125 space-y-2 overflow-y-auto">
                {places.map((place, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${place.isExisting ? 'border-yellow-200 bg-yellow-50 opacity-60' : 'hover:bg-muted/50'}`}
                  >
                    <Checkbox
                      checked={selected.has(i)}
                      onCheckedChange={() => toggleSelect(i)}
                      disabled={place.isExisting}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {place.businessName}
                          {place.isExisting && (
                            <Badge variant="secondary" className="mr-2 text-[10px]">
                              قبلاً ثبت شده
                            </Badge>
                          )}
                        </p>
                        <EditPlaceDialog
                          place={place}
                          index={i}
                          onSave={handleEditPlace}
                          isExisting={place.isExisting}
                        />
                      </div>
                      <p className="text-primary mt-0.5 w-fit text-xs" dir="ltr">
                        {place.phoneNumber || 'بدون شماره'}
                      </p>
                      {place.address && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {place.address}
                        </p>
                      )}
                    </div>
                    {place.rating && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        ⭐ {place.rating}
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* نقشه */}
          <div className="max-h-150 min-h-100">
            <ResultsMap
              places={places}
              center={{
                lat: parseFloat(latitude) || 35.6892,
                lng: parseFloat(longitude) || 51.389,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

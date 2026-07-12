'use client';

import { Loader2, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface Place {
  businessName: string;
  phoneNumber: string;
  address: string;
  category: string;
  rating: number | null;
  ratingCount: number | null;
}

export function NeshanSearch() {
  const [query, setQuery] = useState('آهن‌آلات');
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
    if (!query) return;
    setLoading(true);
    setImportResults(null);
    try {
      const params = new URLSearchParams({ query });
      const res = await fetch(`/api/leads/search-neshan?${params}`);
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
    if (selected.size === places.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(places.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = Array.from(selected).map((i) => ({
      businessName: places[i].businessName,
      phoneNumber: places[i].phoneNumber || '',
      address: places[i].address || '',
      industry: query,
      source: 'نشان',
      notes: places[i].category ? `دسته: ${places[i].category}` : '',
      rating: places[i].rating,
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
            <MapPin className="h-4 w-4 text-blue-500" />
            جستجو در نشان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="جستجو در نشان..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {places.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">نتایج ({places.length} مورد)</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
                  <Checkbox checked={selectedCount === places.length} onCheckedChange={toggleAll} />
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
            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {places.map((place, i) => (
                <label
                  key={i}
                  className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Checkbox checked={selected.has(i)} onCheckedChange={() => toggleSelect(i)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{place.businessName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {place.category && (
                        <Badge variant="outline" className="text-[10px]">
                          {place.category}
                        </Badge>
                      )}
                      {place.rating && (
                        <span className="text-muted-foreground text-xs">⭐ {place.rating}</span>
                      )}
                    </div>
                    {place.address && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {place.address}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

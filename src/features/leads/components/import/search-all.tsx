'use client';

import { Loader2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { useListOptions } from '@/features/settings/hooks/use-list-options';

interface Place {
  businessName: string;
  phoneNumber: string;
  address: string;
  category: string;
  industry: string;
  keyword: string;
  source: string;
  isExisting?: boolean;
}

export function SearchAll() {
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set(['آهن‌آلات']));
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const { data: industryOptions = [] } = useListOptions('INDUSTRY');

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) => {
      const next = new Set(prev);
      next.has(industry) ? next.delete(industry) : next.add(industry);
      return next;
    });
  };

  const handleSearch = async () => {
    if (selectedIndustries.size === 0) {
      toast.error('حداقل یک صنعت انتخاب کنید');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leads/search-all?industries=${Array.from(selectedIndustries).join(',')}`,
        {
          method: 'POST',
        }
      );
      const data = await res.json();
      setPlaces(data.places || []);
      setSelected(new Set());
      toast.success(`${data.total} مورد پیدا شد (${data.newLeads} جدید)`);
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

  const handleImport = async () => {
    setImporting(true);
    const toImport = Array.from(selected).map((i) => ({
      businessName: places[i].businessName,
      phoneNumber: places[i].phoneNumber,
      industry: places[i].industry,
      source: places[i].source,
      address: places[i].address,
    }));

    try {
      const res = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toImport }),
      });
      const results = await res.json();
      toast.success(`${results.imported} سرنخ وارد شد (${results.skipped} تکراری)`);
    } catch {
      toast.error('خطا در وارد کردن');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* تنظیمات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">جستجوی سراسری</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* انتخاب صنعت‌ها */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs">صنعت‌های مورد نظر:</p>
              <div className="flex flex-wrap gap-1.5">
                {industryOptions.map((opt) => (
                  <Badge
                    key={opt.id}
                    variant={selectedIndustries.has(opt.value) ? 'default' : 'outline'}
                    className="cursor-pointer text-[11px] transition-all hover:scale-105"
                    onClick={() => toggleIndustry(opt.value)}
                  >
                    {opt.value}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              جستجوی همه (نشان + بلد)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نتایج */}
      {places.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">نتایج ({places.length} مورد)</CardTitle>
              <Button size="sm" onClick={handleImport} disabled={selected.size === 0 || importing}>
                <Plus className="ml-2 h-3 w-3" />
                {importing ? 'در حال وارد کردن...' : `وارد کردن (${selected.size})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-150 space-y-2 overflow-y-auto">
              {places.map((place, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    place.isExisting
                      ? 'border-yellow-200 bg-yellow-50 opacity-60'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={selected.has(i)}
                    onCheckedChange={() => toggleSelect(i)}
                    disabled={place.isExisting}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{place.businessName}</p>
                      {place.isExisting && (
                        <Badge variant="secondary" className="text-[10px]">
                          قبلاً ثبت شده
                        </Badge>
                      )}
                    </div>
                    <p className="text-primary mt-0.5 text-xs" dir="ltr">
                      {place.phoneNumber}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {place.industry}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {place.source}
                      </Badge>
                      {place.category && (
                        <Badge variant="outline" className="text-[10px]">
                          {place.category}
                        </Badge>
                      )}
                    </div>
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

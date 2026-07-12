'use client';

import { Loader2, MapPin, Plus, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useListOptions } from '@/features/settings/hooks/use-list-options';

const MapPicker = dynamic(() => import('./map-picker').then((mod) => mod.MapPicker), {
  ssr: false,
});

interface Place {
  businessName: string;
  phoneNumber: string;
  address: string;
  rating: number | null;
  location?: { lat: number; lng: number };
  isExisting?: boolean;
}

const INDUSTRY_KEYWORDS: Record<string, string> = {
  آهن‌آلات: 'آهن‌آلات,فروش آهن,میلگرد,ورق آهن,پروفیل',
  فولاد: 'فولاد,محصولات فولادی,ورق فولاد,لوله فولادی',
  پلیمر: 'پلیمر,محصولات پلیمری,پلاستیک,تزریق پلاستیک',
  پتروشیمی: 'پتروشیمی,محصولات پتروشیمی,فرآورده‌های نفتی',
  الکترونیک: 'الکترونیک,قطعات الکترونیکی,لوازم الکترونیک',
  'مواد غذایی': 'مواد غذایی,تولید مواد غذایی,بسته‌بندی مواد غذایی',
  ساختمانی: 'مصالح ساختمانی,فروش مصالح,تولید مصالح,ساختمان',
  خودرو: 'خودرو,لوازم یدکی,نمایندگی خودرو,تعمیرگاه خودرو',
  بازرگانی: 'بازرگانی,شرکت بازرگانی,واردات,صادرات',
  دارویی: 'دارو,داروخانه,شرکت دارویی,پخش دارو',
};

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

  const { data: industryOptions = [] } = useListOptions('INDUSTRY');

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setKeywords(INDUSTRY_KEYWORDS[value] || value);
  };

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
    if (selected.size === places.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(places.map((_, i) => i)));
    }
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs">صنعت</label>
              <Select value={industry} onValueChange={handleIndustryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.value}>
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground text-xs">کلیدواژه‌ها</label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="کلمات را با کاما جدا کنید"
              />
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground text-xs">شعاع (متر)</label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">۱ کیلومتر</SelectItem>
                  <SelectItem value="2000">۲ کیلومتر</SelectItem>
                  <SelectItem value="3000">۳ کیلومتر</SelectItem>
                  <SelectItem value="5000">۵ کیلومتر</SelectItem>
                  <SelectItem value="10000">۱۰ کیلومتر</SelectItem>
                  <SelectItem value="20000">۲۰ کیلومتر</SelectItem>
                  <SelectItem value="50000">۵۰ کیلومتر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground text-xs">تعداد نتایج</label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">۵ تا</SelectItem>
                  <SelectItem value="10">۱۰ تا</SelectItem>
                  <SelectItem value="15">۱۵ تا</SelectItem>
                  <SelectItem value="20">۲۰ تا (حداکثر)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground text-xs">مختصات</label>
              <div className="flex gap-2">
                <Input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="عرض"
                  className="text-xs"
                />
                <Input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="طول"
                  className="text-xs"
                />
              </div>
              <MapPicker
                value={{ lat: latitude, lng: longitude }}
                onChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
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
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                نتایج جستجو ({places.length} مورد)
              </CardTitle>
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
                    <p className="text-sm font-medium">
                      {place.businessName}
                      {place.isExisting && (
                        <Badge variant="secondary" className="mr-2 text-[10px]">
                          قبلاً ثبت شده
                        </Badge>
                      )}
                    </p>
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
      )}
    </div>
  );
}

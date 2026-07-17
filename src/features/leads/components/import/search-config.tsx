'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { Layers, MapPin, Plus, Search, Tag, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { generateSearchKeywords } from './keywords/generator';

const MapPicker = dynamic(() => import('./map-picker').then((m) => m.MapPicker), { ssr: false });

interface Props {
  keyword: string;
  latitude: string;
  longitude: string;
  radius: string;
  onKeywordChange: (v: string) => void;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  onRadiusChange: (v: string) => void;
}

export function SearchConfig({
  keyword,
  latitude,
  longitude,
  radius,
  onKeywordChange,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
}: Props) {
  const { data: industries = [] } = useListOptions('INDUSTRY');
  const [newKeyword, setNewKeyword] = useState('');

  const keywords = keyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // Default keywords for current industry (always available to add)
  const defaultKeywords = useMemo(() => {
    const first = keywords[0] ?? '';
    return generateSearchKeywords({ keyword: first });
  }, [keywords[0]]);

  // Default keywords that are NOT currently selected
  const availableDefaults = defaultKeywords.filter((k) => !keywords.includes(k));

  const selectedIndustry = industries.find((item) => {
    const clean = item.value.replace(/\u200C/g, ' ').trim();
    return clean === keywords[0];
  });

  function handleIndustryChange(value: string) {
    const aliases = generateSearchKeywords({ keyword: value });
    onKeywordChange(aliases.join(', '));
  }

  function removeKeyword(index: number) {
    const next = keywords.filter((_, i) => i !== index);
    onKeywordChange(next.join(', '));
  }

  function addKeyword(kw: string) {
    const clean = kw.trim();
    if (!clean || keywords.includes(clean)) return;
    onKeywordChange([...keywords, clean].join(', '));
    setNewKeyword('');
  }

  function addDefaultKeyword(kw: string) {
    onKeywordChange([...keywords, kw].join(', '));
  }

  return (
    <div className="space-y-5">
      {/* Industry Select */}
      <div className="space-y-2">
        <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
            <Tag className="h-3.5 w-3.5 text-amber-600" />
          </div>
          صنعت
        </Label>
        <Select value={selectedIndustry?.value ?? ''} onValueChange={handleIndustryChange}>
          <SelectTrigger className="border-muted bg-muted/20 h-11! w-full rounded-xl border-2 text-sm transition-all focus:border-amber-200 focus:bg-white">
            <SelectValue placeholder="یک صنعت انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((item) => (
              <SelectItem key={item.id} value={item.value}>
                {item.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Keywords */}
      <div className="space-y-2.5">
        <Label className="text-muted-foreground flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
              <Search className="h-3.5 w-3.5 text-blue-600" />
            </div>
            کلیدواژه‌های فعال
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
            {keywords.length}
          </span>
        </Label>

        {/* Active keywords */}
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw, i) => (
            <Badge
              key={`${kw}-${i}`}
              variant="outline"
              className="gap-1.5 py-1.5 pr-1.5 pl-3 text-xs font-normal bg-primary/10 text-primary transition-all"
            >
              {kw}
              <button
                onClick={() => removeKeyword(i)}
                className="flex h-4 w-4 items-center justify-center rounded-full opacity-60 transition-all hover:bg-white/50 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Available defaults */}
        {availableDefaults.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-[10px]">کلیدواژه‌های پیشنهادی:</p>
            <div className="flex flex-wrap gap-1">
              {availableDefaults.map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="text-muted-foreground cursor-pointer gap-1 py-1 pr-2 pl-2 text-[11px] font-normal transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => addDefaultKeyword(kw)}
                >
                  <Plus className="h-3 w-3" />
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add custom */}
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addKeyword(newKeyword)}
            placeholder="کلیدواژه دلخواه..."
            className="border-muted bg-muted/20 h-10 rounded-xl border-2 text-sm transition-all focus:border-blue-200 focus:bg-white"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => addKeyword(newKeyword)}
            disabled={!newKeyword.trim()}
            className="h-10 w-10 shrink-0 rounded-xl border-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Radius & Coordinates */}
      <div className="border-muted bg-muted/10 rounded-xl border-2 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-50">
                <Layers className="h-3.5 w-3.5 text-green-600" />
              </div>
              شعاع جستجو
            </Label>
            <Select value={radius} onValueChange={onRadiusChange}>
              <SelectTrigger className="border-muted h-11! w-full rounded-xl border-2 bg-white text-sm transition-all focus:border-green-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">۱ کیلومتر</SelectItem>
                <SelectItem value="2">۲ کیلومتر</SelectItem>
                <SelectItem value="5">۵ کیلومتر</SelectItem>
                <SelectItem value="10">۱۰ کیلومتر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
              </div>
              مختصات مرکز
            </Label>
            <div className="flex gap-1.5">
              <Input
                dir="ltr"
                value={latitude}
                onChange={(e) => onLatitudeChange(e.target.value)}
                placeholder="Lat"
                className="border-muted h-11 rounded-xl border-2 bg-white text-center text-xs transition-all focus:border-red-200"
              />
              <Input
                dir="ltr"
                value={longitude}
                onChange={(e) => onLongitudeChange(e.target.value)}
                placeholder="Lng"
                className="border-muted h-11 rounded-xl border-2 bg-white text-center text-xs transition-all focus:border-red-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <Card className="border-muted overflow-hidden rounded-xl border-2 shadow-none">
        <CardContent className="px-4">
          <MapPicker
            value={{ lat: latitude, lng: longitude }}
            onChange={(lat, lng) => {
              onLatitudeChange(lat);
              onLongitudeChange(lng);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

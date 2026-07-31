// src/features/leads/components/import/search-config.tsx

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
import { Layers, MapPin, Plus, Search, StepForward, Target, X, ZoomIn } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { IndustrySelector } from './industry-selector';
import { generateSearchKeywords } from './keywords/generator';
import { PresetConfig } from './preset-config';

const MapPicker = dynamic(() => import('./map-picker').then((m) => m.MapPicker), { ssr: false });

interface Props {
  keyword: string;
  latitude: string;
  longitude: string;
  radius: string;
  zoom?: string;
  step?: string;
  onKeywordChange: (v: string) => void;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  onRadiusChange: (v: string) => void;
  onZoomChange?: (v: string) => void;
  onStepChange?: (v: string) => void;
  onSearch?: () => void;
  isSearching?: boolean;
  selectedSourcesCount?: number;
}

export function SearchConfig({
  keyword,
  latitude,
  longitude,
  radius,
  zoom = '19',
  step = '0.2',
  onKeywordChange,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
  onZoomChange,
  onStepChange,
  onSearch,
  isSearching = false,
  selectedSourcesCount = 0,
}: Props) {
  const { data: industries = [] } = useListOptions('INDUSTRY');
  const [newKeyword, setNewKeyword] = useState('');

  // استخراج صنایع از کلیدواژه‌ها
  const keywords = keyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(() => {
    // اگر کلیدواژه‌ها وجود داره، اولین صنعت رو انتخاب کن
    if (keywords.length > 0) {
      const firstKeyword = keywords[0];
      const matchedIndustry = industries.find((item) => {
        const clean = item.value.replace(/\u200C/g, ' ').trim();
        return (
          clean === firstKeyword ||
          generateSearchKeywords({ keyword: clean }).includes(firstKeyword)
        );
      });
      if (matchedIndustry) {
        // کلیدواژه‌های این صنعت رو استخراج کن
        const indKeywords = generateSearchKeywords({ keyword: matchedIndustry.value });
        const allKeywords = indKeywords.join(', ');
        if (allKeywords === keyword) {
          return [matchedIndustry.value];
        }
      }
    }
    return [];
  });

  const handleIndustryChange = (industries: string[], newKeywords: string) => {
    setSelectedIndustries(industries);
    onKeywordChange(newKeywords);
  };

  const defaultKeywords = useMemo(() => {
    if (selectedIndustries.length === 0) return [];
    // کلیدواژه‌های پیشنهادی از همه صنایع انتخاب شده
    const all = selectedIndustries.flatMap((ind) => generateSearchKeywords({ keyword: ind }));
    // حذف تکراری‌ها
    return [...new Set(all)];
  }, [selectedIndustries]);

  const availableDefaults = defaultKeywords.filter((k) => !keywords.includes(k));

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

  // محاسبه تعداد نقاط جستجو
  const calculateGridPoints = () => {
    const radiusNum = parseFloat(radius);
    const stepNum = parseFloat(step);
    if (!radiusNum || !stepNum) return 0;
    const gridSize = Math.ceil(radiusNum / stepNum) + 1;
    return Math.pow(gridSize * 2 - 1, 2);
  };

  const totalPoints = calculateGridPoints();

  return (
    <div className="space-y-5">
      {/* Preset Config */}
      {onZoomChange && onStepChange && (
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50">
              <Target className="h-3.5 w-3.5 text-gray-600" />
            </div>
            تنظیمات سریع
          </Label>
          <PresetConfig
            onApply={({ radius: r, step: s, zoom: z }) => {
              onRadiusChange(r);
              onStepChange?.(s);
              onZoomChange?.(z);
            }}
            currentRadius={radius}
            currentStep={step}
            currentZoom={zoom}
          />
        </div>
      )}

      {/* Industry Selector - جدید */}
      <IndustrySelector
        selectedIndustries={selectedIndustries}
        onChange={handleIndustryChange}
        options={industries.map((item) => item.value)}
      />

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

        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw, i) => (
            <Badge
              key={`${kw}-${i}`}
              variant="outline"
              className="bg-primary/10 text-primary gap-1.5 py-1.5 pr-1.5 pl-3 text-xs font-normal transition-all"
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

        {availableDefaults.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-[10px]">کلیدواژه‌های پیشنهادی:</p>
            <div className="flex flex-wrap gap-1">
              {availableDefaults.slice(0, 10).map((kw) => (
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
              {availableDefaults.length > 10 && (
                <span className="text-muted-foreground self-center text-[10px]">
                  +{availableDefaults.length - 10} بیشتر
                </span>
              )}
            </div>
          </div>
        )}

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

      {/* Radius & Step & Coordinates & Zoom */}
      <div className="border-muted bg-muted/10 rounded-xl border-2 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Radius */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-50">
                <Layers className="h-3.5 w-3.5 text-green-600" />
              </div>
              شعاع جستجو (کیلومتر)
            </Label>
            <Select value={radius} onValueChange={onRadiusChange}>
              <SelectTrigger className="border-muted h-11! w-full rounded-xl border-2 bg-white text-sm transition-all focus:border-green-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">۵۰۰ متر</SelectItem>
                <SelectItem value="1">۱ کیلومتر</SelectItem>
                <SelectItem value="1.5">۱.۵ کیلومتر</SelectItem>
                <SelectItem value="2">۲ کیلومتر</SelectItem>
                <SelectItem value="3">۳ کیلومتر</SelectItem>
                <SelectItem value="5">۵ کیلومتر</SelectItem>
                <SelectItem value="10">۱۰ کیلومتر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step */}
          {onStepChange && (
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
                  <StepForward className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                گام جستجو (کیلومتر)
              </Label>
              <Select value={step} onValueChange={onStepChange}>
                <SelectTrigger className="border-muted h-11! w-full rounded-xl border-2 bg-white text-sm transition-all focus:border-indigo-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">۱۰۰ متر (بیشترین دقت)</SelectItem>
                  <SelectItem value="0.15">۱۵۰ متر (دقت بالا)</SelectItem>
                  <SelectItem value="0.2">۲۰۰ متر (پیشنهادی)</SelectItem>
                  <SelectItem value="0.25">۲۵۰ متر</SelectItem>
                  <SelectItem value="0.3">۳۰۰ متر</SelectItem>
                  <SelectItem value="0.4">۴۰۰ متر</SelectItem>
                  <SelectItem value="0.5">۵۰۰ متر</SelectItem>
                  <SelectItem value="0.7">۷۰۰ متر</SelectItem>
                  <SelectItem value="1">۱ کیلومتر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Coordinates */}
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

          {/* Zoom */}
          {onZoomChange && (
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50">
                  <ZoomIn className="h-3.5 w-3.5 text-purple-600" />
                </div>
                زوم نقشه
              </Label>
              <Select value={zoom} onValueChange={onZoomChange}>
                <SelectTrigger className="border-muted h-11! w-full rounded-xl border-2 bg-white text-sm transition-all focus:border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">۱۰ (شهر)</SelectItem>
                  <SelectItem value="12">۱۲ (منطقه)</SelectItem>
                  <SelectItem value="14">۱۴ (محله)</SelectItem>
                  <SelectItem value="16">۱۶ (خیابان)</SelectItem>
                  <SelectItem value="17">۱۷ (نزدیک)</SelectItem>
                  <SelectItem value="18">۱۸ (خیلی نزدیک)</SelectItem>
                  <SelectItem value="19">۱۹ (بسیار دقیق) - پیش‌فرض</SelectItem>
                  <SelectItem value="20">۲۰ (فوق دقیق)</SelectItem>
                  <SelectItem value="21">۲۱ (حداکثر جزئیات)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Info: Total grid points */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/50 px-4 py-2 text-xs">
          <span className="text-muted-foreground">تعداد نقاط جستجو:</span>
          <Badge variant="secondary" className="font-mono">
            ~{totalPoints} نقطه
          </Badge>
          <span className="text-muted-foreground">
            (شعاع {radius} کیلومتر × گام {step} کیلومتر)
          </span>
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

      {/* دکمه جستجوی یکپارچه */}
      {onSearch && (
        <Button
          className="w-full gap-2"
          onClick={onSearch}
          disabled={isSearching || selectedSourcesCount === 0 || selectedIndustries.length === 0}
          size="lg"
        >
          {isSearching ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              در حال جستجو در {selectedSourcesCount} منبع...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              جستجو در همه منابع
              {selectedSourcesCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {selectedSourcesCount} منبع
                </Badge>
              )}
              {selectedIndustries.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {selectedIndustries.length} صنعت
                </Badge>
              )}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

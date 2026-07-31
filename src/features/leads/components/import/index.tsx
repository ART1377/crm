// src/features/leads/components/import/import-page.tsx

'use client';

import { Compass, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import { BaladSearch } from './balad-search';
import { GoogleSearch } from './google-search';
import { NeshanSearch } from './neshan-search';
import { SearchConfig } from './search-config';

const SEARCH_SOURCES = [
  {
    value: 'balad',
    label: 'بلد',
    icon: Compass,
    color: 'text-blue-600 border-blue-200 bg-blue-50',
    description: 'API رسمی',
  },
  {
    value: 'google',
    label: 'گوگل مپ',
    icon: MapPin,
    color: 'text-red-600 border-red-200 bg-red-50',
    description: 'API رسمی',
  },
  {
    value: 'neshan',
    label: 'نشان',
    icon: Navigation,
    color: 'text-purple-600 border-purple-200 bg-purple-50',
    description: 'Scraping',
  },
] as const;

type SearchSource = (typeof SEARCH_SOURCES)[number]['value'];

export function ImportPage() {
  const [selectedSources, setSelectedSources] = useState<Set<SearchSource>>(
    new Set(['balad', 'google', 'neshan'])
  );

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    latitude: '35.6607',
    longitude: '51.3156',
    radius: '2',
    zoom: '19',
    step: '0.2',
  });

  const toggleSource = (source: SearchSource) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        // حداقل یک منبع باید انتخاب شده باشه
        if (newSet.size === 1) return prev;
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  const renderSearchComponents = () => {
    const components = [];

    if (selectedSources.has('balad')) {
      components.push(
        <div key="balad" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Compass className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">جستجو در بلد</h3>
            <Badge variant="outline" className="text-[10px]">
              API
            </Badge>
          </div>
          <BaladSearch sharedParams={searchParams} />
        </div>
      );
    }

    if (selectedSources.has('google')) {
      components.push(
        <div key="google" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold">جستجو در گوگل مپ</h3>
            <Badge variant="outline" className="text-[10px]">
              API
            </Badge>
          </div>
          <GoogleSearch sharedParams={searchParams} />
        </div>
      );
    }

    if (selectedSources.has('neshan')) {
      components.push(
        <div key="neshan" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Navigation className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">جستجو در نشان</h3>
            <Badge variant="outline" className="text-[10px]">
              Scraping
            </Badge>
          </div>
          <NeshanSearch sharedParams={searchParams} />
        </div>
      );
    }

    return components;
  };

  return (
    <PageWrapper header={<PageHeader title="وارد کردن سرنخ" description="جستجوی کسب و کارها" />}>
      <div className="space-y-6">
        {/* انتخاب منابع جستجو */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">منابع جستجو:</span>
                <span className="text-muted-foreground text-xs">
                  {selectedSources.size} منبع انتخاب شده
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {SEARCH_SOURCES.map((source) => {
                  const Icon = source.icon;
                  const isSelected = selectedSources.has(source.value);
                  return (
                    <label
                      key={source.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all ${
                        isSelected
                          ? source.color + ' border-opacity-100'
                          : 'border-muted hover:border-muted-foreground/20'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSource(source.value)}
                      />
                      <Icon
                        className={`h-4 w-4 ${isSelected ? 'text-current' : 'text-muted-foreground'}`}
                      />
                      <span className="text-sm font-medium">{source.label}</span>
                      <span className="text-muted-foreground text-[10px]">
                        ({source.description})
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <span>💡 حداقل یک منبع باید انتخاب شود</span>
                <span>⚡ جستجو به صورت همزمان انجام می‌شود</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* فرم تنظیمات مشترک */}
        <SearchConfig
          keyword={searchParams.keyword}
          latitude={searchParams.latitude}
          longitude={searchParams.longitude}
          radius={searchParams.radius}
          zoom={searchParams.zoom}
          step={searchParams.step}
          onKeywordChange={(v) => setSearchParams((p) => ({ ...p, keyword: v }))}
          onLatitudeChange={(v) => setSearchParams((p) => ({ ...p, latitude: v }))}
          onLongitudeChange={(v) => setSearchParams((p) => ({ ...p, longitude: v }))}
          onRadiusChange={(v) => setSearchParams((p) => ({ ...p, radius: v }))}
          onZoomChange={(v) => setSearchParams((p) => ({ ...p, zoom: v }))}
          onStepChange={(v) => setSearchParams((p) => ({ ...p, step: v }))}
        />

        {/* نتایج جستجو از منابع انتخاب شده */}
        {selectedSources.size > 0 && <div className="space-y-8">{renderSearchComponents()}</div>}
      </div>
    </PageWrapper>
  );
}

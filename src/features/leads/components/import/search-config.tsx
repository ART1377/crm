'use client';

import { MapPin, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';

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

import { INDUSTRY_KEYWORDS } from '../../constants/import-keywords';

const MapPicker = dynamic(() => import('./map-picker').then((mod) => mod.MapPicker), {
  ssr: false,
});

interface SearchConfigProps {
  industry: string;
  keywords: string;
  latitude: string;
  longitude: string;
  radius: string;
  onIndustryChange: (industry: string) => void;
  onKeywordsChange: (keywords: string) => void;
  onLatitudeChange: (lat: string) => void;
  onLongitudeChange: (lng: string) => void;
  onRadiusChange: (radius: string) => void;
}

export function SearchConfig({
  industry,
  keywords,
  latitude,
  longitude,
  radius,
  onIndustryChange,
  onKeywordsChange,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
}: SearchConfigProps) {
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');

  const handleIndustryChange = (value: string) => {
    onIndustryChange(value);
    onKeywordsChange(INDUSTRY_KEYWORDS[value] || value);
  };

  const handleCoordinateChange = (newLat: string, newLng: string) => {
    onLatitudeChange(newLat);
    onLongitudeChange(newLng);
  };

  return (
    <div className="space-y-5">
      {/* صنعت + کلیدواژه */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* صنعت */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <div className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full">
              <Tag className="text-primary h-3 w-3" />
            </div>
            صنعت
          </Label>
          <Select value={industry} onValueChange={handleIndustryChange}>
            <SelectTrigger className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 w-full rounded-xl border-2 text-sm transition-all">
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

        {/* کلیدواژه‌ها */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs font-medium">کلیدواژه‌ها</Label>
          <Input
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="کلمات را با کاما جدا کنید"
            className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 text-sm transition-all"
          />
        </div>
      </div>

      {/* شعاع + مختصات */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* شعاع */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs font-medium">شعاع جستجو</Label>
          <Select value={radius} onValueChange={onRadiusChange}>
            <SelectTrigger className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 w-full rounded-xl border-2 text-sm transition-all">
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

        {/* مختصات */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <div className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full">
              <MapPin className="text-primary h-3 w-3" />
            </div>
            مختصات
          </Label>
          <div className="flex gap-2">
            <Input
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              placeholder="عرض"
              className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 text-sm transition-all"
              dir="ltr"
            />
            <Input
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              placeholder="طول"
              className="border-muted bg-muted/30 focus:border-primary/50 focus:bg-background h-10 rounded-xl border-2 text-sm transition-all"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* نقشه */}
      <Card className="border-muted overflow-hidden rounded-xl border-2">
        <CardContent className="px-4">
          <MapPicker value={{ lat: latitude, lng: longitude }} onChange={handleCoordinateChange} />
        </CardContent>
      </Card>
    </div>
  );
}

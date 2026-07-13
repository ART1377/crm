'use client';

import { Compass, MapPin, Navigation } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { BaladSearch } from './balad-search';
import { NeshanSearch } from './neshan-search';
import { PlacesSearch } from './places-search';

const TABS = [
  { value: 'google', label: 'گوگل مپ', icon: MapPin },
  { value: 'neshan', label: 'نشان', icon: Navigation },
  { value: 'balad', label: 'بلد', icon: Compass },
] as const;

export function ImportPage() {
  return (
    <PageWrapper
      header={<PageHeader title="وارد کردن سرنخ" description="جستجو و وارد کردن کسب‌وکارها" />}
    >
      <Tabs defaultValue="google" className="flex flex-col space-y-6">
        <TabsList className="bg-muted/50 w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="shrink-0 gap-1.5 rounded-md px-4 py-2 text-xs font-medium data-[state=active]:bg-gray-200"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="google">
          <PlacesSearch />
        </TabsContent>

        <TabsContent value="neshan">
          <NeshanSearch />
        </TabsContent>

        <TabsContent value="balad">
          <BaladSearch />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

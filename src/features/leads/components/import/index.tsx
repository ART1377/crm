'use client';

import { Compass, MapPin, Navigation } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { BaladSearch } from './balad-search';
import { GoogleSearch } from './google-search';
import { NeshanSearch } from './neshan-search';

const TABS = [
  {
    value: 'balad',
    label: 'بلد',
    icon: Compass,
  },
  {
    value: 'google',
    label: 'گوگل مپ',
    icon: MapPin,
  },
  {
    value: 'neshan',
    label: 'نشان',
    icon: Navigation,
  },
] as const;

export function ImportPage() {
  return (
    <PageWrapper header={<PageHeader title="وارد کردن سرنخ" description="جستجوی کسب و کارها" />}>
      <Tabs defaultValue="balad" className="flex-col space-y-6">
        <TabsList className="bg-muted/50 flex w-full justify-start gap-1 overflow-x-auto rounded-lg p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-primary/10 gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="balad">
          <BaladSearch />
        </TabsContent>

        <TabsContent value="google">
          <GoogleSearch />
        </TabsContent>

        <TabsContent value="neshan">
          <NeshanSearch />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

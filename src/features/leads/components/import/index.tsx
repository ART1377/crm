'use client';

import { Compass, MapPin, Navigation } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { BaladSearch } from './balad-search';

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
      <Tabs defaultValue="balad" className="space-y-6 flex-col">
        <TabsList className="bg-muted/50 flex w-full justify-start gap-1 overflow-x-auto rounded-lg p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2 data-[state=active]:bg-primary/10">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="balad">
          <BaladSearch />
        </TabsContent>

        <TabsContent value="google">
          <div className="text-muted-foreground py-20 text-center">به زودی...</div>
        </TabsContent>

        <TabsContent value="neshan">
          <div className="text-muted-foreground py-20 text-center">به زودی...</div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

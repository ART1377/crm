import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NeshanSearch } from '@/features/leads/components/import/neshan-search';
import { PlacesSearch } from '@/features/leads/components/import/places-search';

export default function ImportLeadsPage() {
  return (
    <PageWrapper
      header={<PageHeader title="وارد کردن سرنخ" description="جستجو و وارد کردن کسب‌وکارها" />}
    >
      <Tabs defaultValue="google" className="flex flex-col space-y-6">
        <TabsList className="bg-muted/50 w-full justify-start gap-1 overflow-x-auto rounded-lg p-1">
          <TabsTrigger value="google" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            Google Maps
          </TabsTrigger>
          <TabsTrigger value="neshan" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            نشان
          </TabsTrigger>
        </TabsList>
        <TabsContent value="google">
          <PlacesSearch />
        </TabsContent>
        <TabsContent value="neshan">
          <NeshanSearch />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

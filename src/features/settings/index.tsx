"use client";

import { List, MessageSquare, Settings2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { SenderInfoForm } from "./components/info-form";
import { ListOptionsManager } from "./components/list-options-manager";
import { MessengersTable } from "./components/messengers-table";
import { SettingsPageSkeleton } from "./components/skeleton";
import { useSettingsPage } from "./hooks/use-settings-page";

const TABS = [
  { value: "general", label: "فرستنده", icon: Settings2 },
  { value: "messengers", label: "پیام‌رسان‌ها", icon: MessageSquare },
  { value: "sources", label: "منابع", icon: List },
  { value: "industries", label: "حوزه‌ها", icon: List },
] as const;

export function SettingsPage() {
  const { isLoading, activeTab, setActiveTab, register, handleSubmit, onSubmit, isPending } =
    useSettingsPage();

  if (isLoading) return <SettingsPageSkeleton />;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="تنظیمات"
          description="مدیریت اطلاعات فرستنده، پیام‌رسان‌ها و گزینه‌های لیست"
        />
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
        <TabsList className="bg-muted/50 w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <SenderInfoForm
            register={register}
            onSubmit={handleSubmit(onSubmit)}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="messengers">
          <Card>
            <MessengersTable />
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <ListOptionsManager type="SOURCE" title="منابع سرنخ" />
          </Card>
        </TabsContent>

        <TabsContent value="industries">
          <Card>
            <ListOptionsManager type="INDUSTRY" title="حوزه‌های فعالیت" />
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { List, MessageSquare, Settings2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { useSaveSettings, useSettings } from "@/hooks/use-settings";

import { SenderFormValues, SenderInfoForm } from "./info-form";
import { ListOptionsManager } from "./list-options-manager";
import { MessengersTable } from "./messangers-table";

export function SettingsPage() {
  const { data: settings = {}, isLoading } = useSettings();
  const saveSettings = useSaveSettings();
  const { register, handleSubmit, reset } = useForm<SenderFormValues>();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (Object.keys(settings).length > 0) reset(settings);
  }, []);

  const onSubmit = (data: SenderFormValues) => {
    saveSettings.mutate({ ...data });
  };

  if (isLoading) return null;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="تنظیمات"
          description="مدیریت اطلاعات فرستنده، پیام‌رسان‌ها و گزینه‌های لیست"
        />
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg p-1">
          <TabsTrigger value="general" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            <Settings2 className="h-3.5 w-3.5" />
            فرستنده
          </TabsTrigger>
          <TabsTrigger value="messengers" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            پیام‌رسان‌ها
          </TabsTrigger>
          <TabsTrigger value="sources" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            <List className="h-3.5 w-3.5" />
            منابع
          </TabsTrigger>
          <TabsTrigger value="industries" className="shrink-0 gap-1.5 px-3 py-1.5 text-xs">
            <List className="h-3.5 w-3.5" />
            حوزه‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SenderInfoForm
            register={register}
            onSubmit={handleSubmit(onSubmit)}
            isPending={saveSettings.isPending}
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

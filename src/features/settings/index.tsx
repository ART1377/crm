"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSettings, useSaveSettings } from "@/hooks/use-settings";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessengersTable } from "./messangers-table";
import { SenderFormValues, SenderInfoForm } from "./info-form";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { PageHeader } from "@/components/shared/page-header";
import { ListOptionsManager } from "./list-options-manager";
import { Settings2, MessageSquare, List } from "lucide-react";

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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            اطلاعات فرستنده
          </TabsTrigger>
          <TabsTrigger value="messengers" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            پیام‌رسان‌ها
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <List className="h-4 w-4" />
            منابع سرنخ
          </TabsTrigger>
          <TabsTrigger value="industries" className="gap-2">
            <List className="h-4 w-4" />
            حوزه‌های فعالیت
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

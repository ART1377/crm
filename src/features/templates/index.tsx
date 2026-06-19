"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTemplates } from "@/hooks/use-templates";
import { TemplateCard } from "./card";
import { CreateTemplateDialog } from "./create-dialog";
import { TemplatesSkeleton } from "./skeleton";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { PageHeader } from "@/components/shared/page-header";

export function TemplatesPage() {
  const { data: templates = [], isLoading } = useTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return <TemplatesSkeleton />;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="قالب‌های پیام"
          description="مدیریت متن‌های آماده برای ارسال سریع"
          actions={
            <CreateTemplateDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <Button>
                <Plus className="ml-2 h-5 w-5" />
                قالب جدید
              </Button>
            </CreateTemplateDialog>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 mb-16">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </PageWrapper>
  );
}

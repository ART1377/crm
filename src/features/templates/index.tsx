'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import { useTemplates } from '@/features/templates/hooks/use-templates';

import { TemplateCard } from './components/card';
import { CreateTemplateDialog } from './components/create-dialog';
import { TemplatesSkeleton } from './components/skeleton';

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
            <CreateTemplateDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button>
                <Plus className="ml-2 h-5 w-5" />
                قالب جدید
              </Button>
            </CreateTemplateDialog>
          }
        />
      }
    >
      <div className="mb-16 grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </PageWrapper>
  );
}

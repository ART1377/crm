'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTemplates } from '@/hooks/use-templates'
import { TemplateCard } from './card'
import { CreateTemplateDialog } from './create-dialog'
import { TemplatesSkeleton } from './skeleton'

export function TemplatesPage() {
  const { data: templates = [], isLoading } = useTemplates()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) return <TemplatesSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">قالب‌های پیام</h1>
          <p className="text-muted-foreground mt-1">مدیریت متن‌های آماده برای ارسال سریع</p>
        </div>
        <CreateTemplateDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button>
            <Plus className="ml-2 h-5 w-5" />
            قالب جدید
          </Button>
        </CreateTemplateDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
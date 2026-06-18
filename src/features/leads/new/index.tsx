'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateLead } from '@/hooks/use-leads'
import { leadSchema } from '@/lib/validations'
import type { CreateLeadData } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { LeadForm } from './form'
import { LeadFormActions } from './actions'

export function NewLeadPage() {
  const router = useRouter()
  const createLead = useCreateLead()

  const form = useForm<CreateLeadData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      businessName: '',
      contactPerson: '',
      phoneNumber: '',
      secondaryPhone: '',
      industry: '',
      source: 'DIRECT',
      notes: '',
    },
  })

  const onSubmit = async (data: CreateLeadData) => {
    await createLead.mutateAsync(data)
    router.push('/leads')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">افزودن سرنخ جدید</h1>
          <p className="text-muted-foreground mt-1">اطلاعات کسب‌وکار جدید را وارد کنید</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات سرنخ</CardTitle>
          <CardDescription>فیلدهای ستاره‌دار (*) الزامی هستند</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LeadForm form={form} />
            <LeadFormActions
              onCancel={() => router.back()}
              isPending={createLead.isPending}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
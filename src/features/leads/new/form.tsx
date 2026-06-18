'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CreateLeadData } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LEAD_SOURCES } from '@/lib/constants'
import { FormField } from './form-field'

interface LeadFormProps {
  form: UseFormReturn<CreateLeadData>
}

export function LeadForm({ form }: LeadFormProps) {
  const { register, setValue, formState: { errors } } = form

  return (
    <>
      <FormField label="نام کسب‌وکار *" error={errors.businessName?.message}>
        <Input
          id="businessName"
          placeholder="مثال: آهن‌فروشی فلاحی"
          {...register('businessName')}
        />
      </FormField>

      <FormField label="شخص تماس" error={errors.contactPerson?.message}>
        <Input
          id="contactPerson"
          placeholder="نام و نام خانوادگی"
          {...register('contactPerson')}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="شماره تماس اصلی *" error={errors.phoneNumber?.message}>
          <Input
            id="phoneNumber"
            placeholder="09123456789"
            dir="ltr"
            {...register('phoneNumber')}
          />
        </FormField>

        <FormField label="شماره تماس دوم" error={errors.secondaryPhone?.message}>
          <Input
            id="secondaryPhone"
            placeholder="09123456789"
            dir="ltr"
            {...register('secondaryPhone')}
          />
        </FormField>
      </div>

      <FormField label="حوزه فعالیت *" error={errors.industry?.message}>
        <Input
          id="industry"
          placeholder="مثال: آهن‌آلات، پلیمر، الکترونیک، مواد غذایی"
          {...register('industry')}
        />
      </FormField>

      <FormField label="منبع سرنخ" error={errors.source?.message}>
        <Select
          defaultValue="DIRECT"
          onValueChange={(value) => setValue('source', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="انتخاب منبع" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_SOURCES.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="یادداشت" error={errors.notes?.message}>
        <Textarea
          id="notes"
          placeholder="یادداشت‌های خود را وارد کنید..."
          className="min-h-25"
          {...register('notes')}
        />
      </FormField>
    </>
  )
}
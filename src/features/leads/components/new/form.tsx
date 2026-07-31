// src/features/leads/components/new/form.tsx

'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Building2, Globe, Hash, MapPin, Phone, Star, StickyNote, Tag, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ComboboxInput } from '@/components/shared/combobox-input';

import { useListOptions } from '@/features/settings/hooks/use-list-options';

import { CreateLeadData } from '../../types/leads-types';
import { FormField } from './form-field';

export function LeadForm({ form }: { form: UseFormReturn<CreateLeadData> }) {
  const { data: sourceOptions = [] } = useListOptions('SOURCE');
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');
  const sources = sourceOptions.map((o) => o.value);
  const industries = industryOptions.map((o) => o.value);

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Business name + Contact person */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="نام کسب‌وکار *" error={errors.businessName?.message}>
          <div className="relative">
            <Building2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="businessName"
              placeholder="آهن‌فروشی فلاحی"
              className="pr-10"
              {...register('businessName')}
            />
          </div>
        </FormField>

        <FormField label="شخص تماس" error={errors.contactPerson?.message}>
          <div className="relative">
            <User className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="contactPerson"
              placeholder="نام و نام خانوادگی"
              className="pr-10"
              {...register('contactPerson')}
            />
          </div>
        </FormField>
      </div>

      {/* Phones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="شماره تماس اصلی *" error={errors.phoneNumber?.message}>
          <div className="relative">
            <Phone className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="phoneNumber"
              placeholder="0912 345 6789"
              dir="ltr"
              className="pr-10"
              {...register('phoneNumber')}
            />
          </div>
        </FormField>

        <FormField label="شماره تماس دوم" error={errors.secondaryPhone?.message}>
          <div className="relative">
            <Phone className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="secondaryPhone"
              placeholder="0912 345 6789"
              dir="ltr"
              className="pr-10"
              {...register('secondaryPhone')}
            />
          </div>
        </FormField>
      </div>

      {/* Industry + Source */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="حوزه فعالیت *" error={errors.industry?.message}>
          <ComboboxInput
            value={form.watch('industry')}
            onChange={(value) => form.setValue('industry', value)}
            options={industries}
            placeholder="آهن‌آلات، پلیمر، الکترونیک..."
            icon={<Tag className="h-4 w-4" />}
          />
        </FormField>

        <FormField label="منبع سرنخ" error={errors.source?.message}>
          <ComboboxInput
            value={form.watch('source') ?? ''}
            onChange={(value) => form.setValue('source', value)}
            options={sources}
            placeholder="انتخاب منبع"
            icon={<Hash className="h-4 w-4" />}
          />
        </FormField>
      </div>

      {/* فیلدهای جدید: Address + Website */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="آدرس" error={errors.address?.message}>
          <div className="relative">
            <MapPin className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="address"
              placeholder="آدرس کامل"
              className="pr-10"
              {...register('address')}
            />
          </div>
        </FormField>

        <FormField label="وبسایت" error={errors.website?.message}>
          <div className="relative">
            <Globe className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="website"
              placeholder="example.com"
              dir="ltr"
              className="pr-10"
              {...register('website')}
            />
          </div>
        </FormField>
      </div>

      {/* Category + Rating */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="دسته‌بندی" error={errors.category?.message}>
          <div className="relative">
            <Tag className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="category"
              placeholder="دسته‌بندی کسب‌وکار"
              className="pr-10"
              {...register('category')}
            />
          </div>
        </FormField>

        <FormField label="امتیاز" error={errors.rating?.message}>
          <div className="relative">
            <Star className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="rating"
              placeholder="0 تا 5"
              type="number"
              min="0"
              max="5"
              step="0.1"
              dir="ltr"
              className="pr-10"
              {...register('rating', {
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return undefined;
                  const num = parseFloat(v);
                  return isNaN(num) ? undefined : num;
                },
              })}
            />
          </div>
        </FormField>
      </div>

      {/* Notes */}
      <FormField label="یادداشت" error={errors.notes?.message}>
        <div className="relative">
          <StickyNote className="text-muted-foreground absolute top-3 right-3 h-4 w-4" />
          <Textarea
            id="notes"
            placeholder="یادداشت‌های خود را وارد کنید..."
            className="min-h-28 pr-10"
            {...register('notes')}
          />
        </div>
      </FormField>
    </div>
  );
}

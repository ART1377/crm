'use client';

import type { UseFormRegister } from 'react-hook-form';

import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { SenderFormValues } from '../types/settings-types';
import Field from './field';

interface SenderInfoFormProps {
  register: UseFormRegister<SenderFormValues>;
  onSubmit: () => void;
  isPending: boolean;
}

export function SenderInfoForm({ register, onSubmit, isPending }: SenderInfoFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات فرستنده</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="نام فرستنده">
            <Input {...register('senderName')} />
          </Field>
          <Field label="شماره تماس">
            <Input {...register('senderPhone')} dir="ltr" />
          </Field>
          <Field label="نام شرکت">
            <Input {...register('senderCompany')} />
          </Field>
          <Button type="submit" className="mt-4" disabled={isPending}>
            <Save className="ml-2 h-4 w-4" />
            ذخیره تنظیمات فرستنده
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

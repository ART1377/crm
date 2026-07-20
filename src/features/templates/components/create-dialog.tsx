// src/features/templates/components/create-dialog.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useCreateTemplate, useUpdateTemplate } from '@/features/templates/hooks/use-templates';

import { TemplateFormData, templateSchema } from '../schemas/templates-schemas';
import { MessageTemplate } from '../types/templates-types';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  template?: MessageTemplate;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  children,
  template,
}: CreateTemplateDialogProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isEditing = !!template;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: template?.title || '',
      content: template?.content || '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: template?.title || '',
        content: template?.content || '',
      });
    }
  }, [open, template, reset]);

  const onSubmit = async (data: TemplateFormData) => {
    if (isEditing) {
      await updateTemplate.mutateAsync({ id: template!.id, data });
    } else {
      await createTemplate.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'ویرایش قالب پیام' : 'ایجاد قالب پیام جدید'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان قالب *</Label>
            <Input placeholder="عنوان قالب" {...register('title')} />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>متن پیام *</Label>
            <Textarea placeholder="متن پیام" className="min-h-32" {...register('content')} />
            {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
            <p className="text-muted-foreground text-xs">
              متغیرهای قابل استفاده: {'{senderName}'} {'{senderPhone}'} {'{senderCompany}'}{' '}
              {'{companyName}'} {'{contactPerson}'}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            {createTemplate.isPending || updateTemplate.isPending
              ? 'در حال ذخیره...'
              : isEditing
                ? 'بروزرسانی قالب'
                : 'ذخیره قالب'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

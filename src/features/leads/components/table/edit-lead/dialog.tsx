'use client';

import { useState } from 'react';

import { Building2, Hash, Phone, StickyNote, Tag, User } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { ComboboxInput } from '@/components/shared/combobox-input';

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';
import { Lead } from '@/features/leads/types/leads-types';

import FieldWithIcon from './field';
import { useEditLead } from './hooks/use-edit-lead';

export function EditLeadDialog({ lead, children }: { lead: Lead; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const { form, updateField, handleSubmit, sources, industries, isPending } = useEditLead({
    lead,
    onClose: () => setOpen(false),
  });

  return (
    <Dialog key={lead.id} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش سرنخ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldWithIcon icon={Building2} label="نام کسب‌وکار *">
              <Input
                className="pr-10"
                value={form.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
              />
            </FieldWithIcon>
            <FieldWithIcon icon={User} label="شخص تماس">
              <Input
                className="pr-10"
                value={form.contactPerson}
                onChange={(e) => updateField('contactPerson', e.target.value)}
              />
            </FieldWithIcon>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldWithIcon icon={Phone} label="شماره اصلی *">
              <Input
                className="pr-10"
                dir="ltr"
                value={form.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
              />
            </FieldWithIcon>
            <FieldWithIcon icon={Phone} label="شماره دوم">
              <Input
                className="pr-10"
                dir="ltr"
                value={form.secondaryPhone}
                onChange={(e) => updateField('secondaryPhone', e.target.value)}
              />
            </FieldWithIcon>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>حوزه فعالیت *</Label>
              <ComboboxInput
                value={form.industry}
                onChange={(value) => updateField('industry', value)}
                options={industries}
                placeholder="انتخاب صنعت"
                icon={<Tag className="h-4 w-4" />}
              />
            </div>
            <div className="space-y-2">
              <Label>منبع سرنخ</Label>
              <ComboboxInput
                value={form.source}
                onChange={(value) => updateField('source', value)}
                options={sources}
                placeholder="انتخاب منبع"
                icon={<Hash className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>وضعیت</Label>
            <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FieldWithIcon icon={StickyNote} label="یادداشت">
            <Textarea
              className="min-h-24 pr-10"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </FieldWithIcon>

          <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

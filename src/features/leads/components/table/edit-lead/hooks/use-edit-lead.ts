// src/features/leads/components/table/edit-lead/hooks/use-edit-lead.ts

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { useChangeLeadStatus, useUpdateLead } from '@/features/leads/hooks/use-leads';
import { Lead } from '@/features/leads/types/leads-types';
import { useListOptions } from '@/features/settings/hooks/use-list-options';

export function useEditLead({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const updateLead = useUpdateLead();
  const changeStatus = useChangeLeadStatus();

  const { data: sourceOptions = [] } = useListOptions('SOURCE');
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');

  const sources = sourceOptions.map((o) => o.value);
  const industries = industryOptions.map((o) => o.value);

  const [form, setForm] = useState({
    businessName: lead.businessName,
    contactPerson: lead.contactPerson || '',
    phoneNumber: lead.phoneNumber,
    secondaryPhone: lead.secondaryPhone || '',
    industry: lead.industry,
    source: lead.source as string,
    status: lead.status as string,
    notes: lead.notes || '',
    address: lead.address || '',
    website: lead.website || '',
    category: lead.category || '',
    rating: lead.rating?.toString() || '', // ذخیره به عنوان string
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.businessName || !form.phoneNumber || !form.industry) {
      toast.error('فیلدهای ستاره‌دار الزامی هستند');
      return;
    }

    // تبدیل rating به number یا undefined
    const ratingValue = form.rating ? parseFloat(form.rating) : undefined;
    const finalRating = ratingValue && !isNaN(ratingValue) ? ratingValue : undefined;

    const data = {
      businessName: form.businessName,
      contactPerson: form.contactPerson || undefined,
      phoneNumber: form.phoneNumber,
      secondaryPhone: form.secondaryPhone || undefined,
      industry: form.industry,
      source: form.source,
      status: form.status,
      notes: form.notes || undefined,
      address: form.address || undefined,
      website: form.website || undefined,
      category: form.category || undefined,
      rating: finalRating, // فقط اگر valid باشه
    };

    await updateLead.mutateAsync({ id: lead.id, data });

    if (form.status !== lead.status) {
      await changeStatus.mutateAsync({
        id: lead.id,
        status: form.status,
        previousStatus: lead.status,
      });
    }

    onClose();
  };

  return {
    form,
    updateField,
    handleSubmit,
    sources,
    industries,
    isPending: updateLead.isPending,
  };
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useChangeLeadStatus, useUpdateLead } from "@/features/leads/hooks/use-leads";
import { Lead } from "@/features/leads/types/leads-types";
import { useListOptions } from "@/features/settings/hooks/use-list-options";

export function useEditLead({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const updateLead = useUpdateLead();
  const changeStatus = useChangeLeadStatus();

  const { data: sourceOptions = [] } = useListOptions("SOURCE");
  const { data: industryOptions = [] } = useListOptions("INDUSTRY");

  const sources = sourceOptions.map((o) => o.value);
  const industries = industryOptions.map((o) => o.value);

  const [form, setForm] = useState({
    businessName: lead.businessName,
    contactPerson: lead.contactPerson || "",
    phoneNumber: lead.phoneNumber,
    secondaryPhone: lead.secondaryPhone || "",
    industry: lead.industry,
    source: lead.source as string,
    status: lead.status as string,
    notes: lead.notes || "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.businessName || !form.phoneNumber || !form.industry) {
      toast.error("فیلدهای ستاره‌دار الزامی هستند");
      return;
    }

    await updateLead.mutateAsync({ id: lead.id, data: form });

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

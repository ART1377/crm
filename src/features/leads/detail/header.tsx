"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateLead } from "@/hooks/use-leads";
import { useCreateActivity } from "@/hooks/use-activities";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/types";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header";

interface LeadHeaderProps {
  lead: Lead;
  leadId: string;
}

export function LeadHeader({ lead, leadId }: LeadHeaderProps) {
  const updateLead = useUpdateLead();
  const createActivity = useCreateActivity(leadId);

  const handleStatusChange = async (newStatus: string) => {
    await updateLead.mutateAsync({ id: leadId, data: { status: newStatus } });
    await createActivity.mutateAsync({
      type: "STATUS_CHANGE",
      summary: `تغییر وضعیت به ${LEAD_STATUSES.find((s) => s.value === newStatus)?.label}`,
    });
    toast.success("وضعیت بروزرسانی شد");
  };

  return (
    <PageHeader
      title={lead.businessName}
      description={`آخرین بروزرسانی: ${formatDate(new Date(lead.updatedAt))}`}
      actions={
        <Select value={lead.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    />
  );
}
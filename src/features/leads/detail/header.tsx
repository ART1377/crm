"use client";

import type { Lead } from "@/types";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";

import { useChangeLeadStatus } from "@/hooks/use-leads";

import { LEAD_STATUSES } from "@/lib/constants";
import { countOverdueTasks, formatDate } from "@/lib/utils";

export function LeadHeader({ lead, leadId }: { lead: Lead; leadId: string }) {
  const changeStatus = useChangeLeadStatus();
  const overdueCount = countOverdueTasks(lead.tasks);

  const handleStatusChange = (newStatus: string) => {
    changeStatus.mutate({ id: leadId, status: newStatus, previousStatus: lead.status });
  };

  return (
    <PageHeader
      title={
        <span className="inline-flex items-center gap-2">
          {lead.businessName}
          {overdueCount > 0 && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              {overdueCount} پیگیری نشده
            </Badge>
          )}
        </span>
      }
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

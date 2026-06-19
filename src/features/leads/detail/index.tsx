"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLead } from "@/hooks/use-leads";
import { LeadDetailSkeleton } from "./skeleton";
import { LeadHeader } from "./header";
import { LeadInfo } from "./info";
import { LeadQuickActions } from "./quick-actions";
import { ActivityTimeline } from "./activity-timeline";
import { TemplateSidebar } from "./template-sidebar";
import { TaskSidebar } from "./task-sidebar";
import { PageWrapper } from "@/components/shared/page-wrapper";

export function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { data: lead, isLoading } = useLead(leadId);

  if (isLoading) return <LeadDetailSkeleton />;

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">سرنخ پیدا نشد</h2>
        <p className="text-muted-foreground mt-2">
          این سرنخ وجود ندارد یا حذف شده است
        </p>
        <Link href="/leads" className="mt-4">
          <Button>بازگشت به لیست سرنخ‌ها</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageWrapper header={<LeadHeader lead={lead} leadId={leadId} />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LeadInfo lead={lead} />
          <LeadQuickActions lead={lead} leadId={leadId} />
          <ActivityTimeline
            activities={lead.activities ?? []}
            leadId={leadId}
          />
        </div>

        <div className="space-y-6">
          <TemplateSidebar
            phone={lead.phoneNumber}
            companyName={lead.businessName}
            contactPerson={lead.contactPerson}
          />
          <TaskSidebar tasks={lead.tasks ?? []} leadId={leadId} />
        </div>
      </div>
    </PageWrapper>
  );
}

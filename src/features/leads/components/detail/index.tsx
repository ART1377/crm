'use client';

import { useParams } from 'next/navigation';

import { PageWrapper } from '@/components/shared/page-wrapper';

import { useLead } from '@/features/leads/hooks/use-leads';

import { ActivityTimeline } from './activity-timeline';
import { LeadHeader } from './header';
import { LeadInfo } from './info';
import { NotFound } from './not-found';
import { LeadQuickActions } from './quick-actions';
import { LeadDetailSkeleton } from './skeleton';
import { TaskSidebar } from './task-sidebar';
import { TemplateSidebar } from './template-sidebar';

export function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const { data: lead, isLoading } = useLead(leadId);

  if (isLoading) return <LeadDetailSkeleton />;

  if (!lead) return <NotFound />;

  return (
    <PageWrapper header={<LeadHeader lead={lead} leadId={leadId} />}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LeadInfo lead={lead} />
          <LeadQuickActions lead={lead} leadId={leadId} />
          <ActivityTimeline activities={lead.activities ?? []} leadId={leadId} />
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

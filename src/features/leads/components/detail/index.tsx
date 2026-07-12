'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageWrapper } from '@/components/shared/page-wrapper';

import { ROUTES } from '@/routes/routes';

import { useDeleteLead, useLead } from '@/features/leads/hooks/use-leads';

import { DeleteConfirmDialog } from '@/components/shared/delete-dialog';
import { ActivityTimeline } from './activity-timeline';
import { LeadHeader } from './header';
import { LeadInfo } from './info';
import { MessageChannelSelector } from './message-channel-selector';
import { NotFound } from './not-found';
import { LeadQuickActions } from './quick-actions';
import { LeadDetailSkeleton } from './skeleton';
import { TaskSidebar } from './task-sidebar';
import { TemplateSidebar } from './template-sidebar';

export function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { data: lead, isLoading } = useLead(leadId);
  const deleteLead = useDeleteLead();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) return <LeadDetailSkeleton />;

  if (!lead) return <NotFound />;

  const handleDelete = async () => {
    await deleteLead.mutateAsync(leadId);
    router.push(ROUTES.leads.list);
  };

  return (
    <PageWrapper header={<LeadHeader lead={lead} leadId={leadId} />}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LeadInfo lead={lead} onDelete={() => setShowDeleteDialog(true)} />
          <LeadQuickActions lead={lead} leadId={leadId} />
          <ActivityTimeline activities={lead.activities ?? []} leadId={leadId} />
        </div>

        <div className="space-y-6">
          <MessageChannelSelector leadId={leadId} channels={lead.channels ?? ''} />
          <TemplateSidebar
            phone={lead.phoneNumber}
            companyName={lead.businessName}
            contactPerson={lead.contactPerson}
          />
          <TaskSidebar tasks={lead.tasks ?? []} leadId={leadId} />
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="حذف سرنخ"
        description="آیا از حذف این سرنخ اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        isPending={deleteLead.isPending}
      />
    </PageWrapper>
  );
}

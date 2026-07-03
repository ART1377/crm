import { Suspense } from 'react';

import { LeadsPage } from '@/features/leads/components/table';
import { LeadsPageSkeleton } from '@/features/leads/components/table/skeleton';

export default function Leads() {
  return (
    <Suspense fallback={<LeadsPageSkeleton />}>
      <LeadsPage />
    </Suspense>
  );
}

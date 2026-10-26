// src/app/leads/staged/page.tsx

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { StagedLeadsPage } from '@/features/leads/components/staged';

export default function StagedLeads() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <StagedLeadsPage />
    </Suspense>
  );
}

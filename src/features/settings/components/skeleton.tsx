import { Skeleton } from '@/components/ui/skeleton';

import { PageWrapper } from '@/components/shared/page-wrapper';

export function SettingsPageSkeleton() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-64" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </PageWrapper>
  );
}

// src/features/dashboard/components/skeleton.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

export function DashboardSkeleton() {
  return (
    <PageWrapper
      header={
        <PageHeader
          title={<Skeleton className="h-7 w-40" />}
          actions={<Skeleton className="h-10 w-40" />}
        />
      }
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="min-h-fit flex-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="min-h-fit flex-1">
              <CardContent className="p-3 text-center">
                <Skeleton className="mx-auto mb-1 h-7 w-10" />
                <Skeleton className="mx-auto h-4 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversion + Tasks progress */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-3 h-8 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-3 h-8 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* Calendar heatmap */}
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-55 w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Industry table */}
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="mb-3 h-8 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        {/* Industry pie chart */}
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-125 w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Source conversion table */}
        <Card className="col-span-full min-h-fit">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="mb-3 h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        {/* Source industry chart */}
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Tasks overview */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
            <Skeleton className="mb-3 h-5 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="mb-2 h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

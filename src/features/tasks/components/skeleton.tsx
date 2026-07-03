import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TasksSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <Card>
        <CardContent className="p-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="mb-3 h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

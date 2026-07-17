import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';

import { cn } from '@/lib/utils';

interface StatusCardsProps {
  statusCounts: Record<string, number>;
}

export function StatusCards({ statusCounts }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
      {LEAD_STATUSES.map(({ value, label, color }) => {
        const count = statusCounts[value] ?? 0;
        return (
          <Link key={value} href={`/leads?status=${value}`}>
            <Card className="min-h-fit flex-1 cursor-pointer transition-all hover:scale-[1.02] hover:bg-mist-50">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold">{count}</div>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                    color
                  )}
                >
                  {label}
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

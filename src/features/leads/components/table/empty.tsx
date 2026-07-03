import Link from 'next/link';

import { AlertCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LeadsEmptyStateProps {
  hasFilters: boolean;
}

export function LeadsEmptyState({ hasFilters }: LeadsEmptyStateProps) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
      <AlertCircle className="mb-4 h-12 w-12" />
      <p className="text-lg font-medium">سرنخی پیدا نشد</p>
      <p className="mt-1 text-sm">
        {hasFilters ? 'با فیلترهای فعلی سرنخی یافت نشد' : 'هنوز هیچ سرنخی ثبت نکرده‌اید'}
      </p>
      {!hasFilters && (
        <Link href="/leads/new" className="mt-4">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            افزودن اولین سرنخ
          </Button>
        </Link>
      )}
    </div>
  );
}

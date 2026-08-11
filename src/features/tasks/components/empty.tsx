// src/features/tasks/components/empty.tsx

import Link from 'next/link';

import { AlertCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface TasksEmptyStateProps {
  hasFilters: boolean;
}

export function TasksEmptyState({ hasFilters }: TasksEmptyStateProps) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
      <AlertCircle className="mb-4 h-12 w-12" />
      <p className="text-lg font-medium">تسکی پیدا نشد</p>
      <p className="mt-1 text-sm">
        {hasFilters ? 'با فیلترهای فعلی تسکی یافت نشد' : 'هنوز هیچ تسکی ثبت نکرده‌اید'}
      </p>
      {!hasFilters && (
        <Link href="/leads" className="mt-4">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            افزودن تسک جدید
          </Button>
        </Link>
      )}
    </div>
  );
}

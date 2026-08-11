// src/features/tasks/components/bulk-actions-bar.tsx

'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBulkUpdateTasks } from '@/features/tasks/hooks/use-tasks';

interface BulkActionsBarProps {
  selectedIds: string[];
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function BulkActionsBar({
  selectedIds,
  selectedCount,
  onBulkDelete,
  onClearSelection,
  isDeleting = false,
}: BulkActionsBarProps) {
  const bulkUpdate = useBulkUpdateTasks();

  const handleStatusChange = (status: string) => {
    if (!status) return;
    const isCompleted = status === 'completed';
    bulkUpdate.mutate({ ids: selectedIds, data: { isCompleted } });
  };

  return (
    <div className="bg-primary/5 border-primary/20 mb-3 flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="text-sm font-medium">{selectedCount} تسک انتخاب شد</span>

      <Select value="" onValueChange={handleStatusChange} disabled={bulkUpdate.isPending}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue
            placeholder={bulkUpdate.isPending ? 'در حال بروزرسانی...' : 'تغییر وضعیت گروهی'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="completed">انجام شده</SelectItem>
          <SelectItem value="pending">در انتظار</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="destructive"
        size="sm"
        onClick={onBulkDelete}
        disabled={isDeleting}
        className="gap-1.5"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? 'در حال حذف...' : 'حذف گروهی'}
      </Button>

      <Button variant="ghost" size="sm" onClick={onClearSelection} className="mr-auto">
        لغو انتخاب
      </Button>
    </div>
  );
}

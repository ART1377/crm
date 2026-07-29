// src/features/leads/components/table/bulk-actions-bar.tsx

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

import { LEAD_STATUSES } from '../../constants/leads-constants';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
  isDeleting = false,
}: BulkActionsBarProps) {
  return (
    <div className="bg-primary/5 border-primary/20 mb-3 flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="text-sm font-medium">{selectedCount} سرنخ انتخاب شد</span>

      <Select value="" onValueChange={onBulkStatusChange}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue placeholder="تغییر وضعیت گروهی" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
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

// src/features/tasks/components/bulk-actions-bar.tsx

'use client';

import { Download, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBulkUpdateTasks } from '@/features/tasks/hooks/use-tasks';
import { downloadMultiVCard } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedIds: string[];
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
  selectedTasks: Array<{
    id: string;
    leadId: string;
    lead?: {
      businessName: string;
      phoneNumber: string;
      contactPerson?: string | null;
      secondaryPhone?: string | null;
      industry?: string;
      notes?: string | null;
    };
  }>;
}

export function BulkActionsBar({
  selectedIds,
  selectedCount,
  onBulkDelete,
  onClearSelection,
  isDeleting = false,
  selectedTasks,
}: BulkActionsBarProps) {
  const bulkUpdate = useBulkUpdateTasks();

  const handleStatusChange = (status: string) => {
    if (!status) return;
    const isCompleted = status === 'completed';
    bulkUpdate.mutate({ ids: selectedIds, data: { isCompleted } });
  };

  const handleBulkExport = () => {
    const leads = selectedTasks
      .filter((task) => task.lead)
      .map((task) => ({
        businessName: task.lead!.businessName,
        phoneNumber: task.lead!.phoneNumber,
        contactPerson: task.lead!.contactPerson,
        secondaryPhone: task.lead!.secondaryPhone,
        industry: task.lead!.industry,
        notes: task.lead!.notes,
      }));

    if (leads.length === 0) return;
    downloadMultiVCard(leads);
  };

  const exportableCount = selectedTasks.filter((t) => t.lead).length;

  return (
    <div className="bg-primary/5 border-primary/20 mb-3 rounded-lg border p-2 sm:p-3">
      {/* ردیف اول: تعداد و دکمه بستن */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium sm:text-sm">{selectedCount} تسک انتخاب شد</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="hover:bg-primary/10 h-7 w-7 p-0 sm:h-8 sm:w-auto sm:px-3"
        >
          <X className="h-4 w-4 sm:ml-1.5" />
          <span className="hidden sm:inline">لغو انتخاب</span>
        </Button>
      </div>

      {/* ردیف دوم: اکشن‌ها */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Select value="" onValueChange={handleStatusChange} disabled={bulkUpdate.isPending}>
          <SelectTrigger className="h-8 min-w-25 flex-1 text-xs sm:h-9 sm:min-w-35 sm:text-sm">
            <SelectValue
              placeholder={bulkUpdate.isPending ? 'در حال بروزرسانی...' : 'تغییر وضعیت'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">انجام شده</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkExport}
          disabled={exportableCount === 0}
          className="h-8 flex-1 gap-1 text-xs sm:h-9 sm:flex-none sm:gap-1.5 sm:text-sm"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">ذخیره مخاطبین</span>
          <span className="sm:hidden">{exportableCount}</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="h-8 flex-1 gap-1 text-xs sm:h-9 sm:flex-none sm:gap-1.5 sm:text-sm"
        >
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">حذف گروهی</span>
          <span className="sm:hidden">حذف</span>
        </Button>
      </div>
    </div>
  );
}

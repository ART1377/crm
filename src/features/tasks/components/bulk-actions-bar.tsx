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
  onExportSelected: () => void; // جدید
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
  onExportSelected,
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
    <div className="bg-primary/5 border-primary/20 mb-3 rounded-lg border p-3">
      {/* ردیف اول: تعداد و دکمه بستن */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{selectedCount} تسک انتخاب شد</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 gap-1.5 px-3">
          <X className="h-4 w-4" />
          لغو انتخاب
        </Button>
      </div>

      {/* ردیف دوم: اکشن‌ها - هر کدوم در یک خط جدا در موبایل */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <Select value="" onValueChange={handleStatusChange} disabled={bulkUpdate.isPending}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue
              placeholder={bulkUpdate.isPending ? 'در حال بروزرسانی...' : 'تغییر وضعیت گروهی'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">انجام شده</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
          </SelectContent>
        </Select>

        {/* دکمه خروجی گروهی */}
        <Button
          variant="outline"
          size="default"
          onClick={onExportSelected}
          className="w-full gap-2 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          خروجی ({selectedCount})
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={handleBulkExport}
          disabled={exportableCount === 0}
          className="w-full gap-2 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          ذخیره مخاطبین ({exportableCount})
        </Button>

        <Button
          variant="destructive"
          size="default"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="w-full gap-2 sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'در حال حذف...' : 'حذف گروهی'}
        </Button>
      </div>
    </div>
  );
}

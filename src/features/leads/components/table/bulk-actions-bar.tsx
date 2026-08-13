// src/features/leads/components/table/bulk-actions-bar.tsx

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

import { LEAD_STATUSES } from '../../constants/leads-constants';
import { downloadMultiVCard } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedLeads: Array<{
    id: string;
    businessName: string;
    phoneNumber: string;
    contactPerson?: string | null;
    secondaryPhone?: string | null;
    industry?: string;
    notes?: string | null;
  }>;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  selectedLeads,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
  isDeleting = false,
}: BulkActionsBarProps) {
  const handleBulkExport = () => {
    if (selectedLeads.length === 0) return;
    downloadMultiVCard(selectedLeads);
  };

  return (
    <div className="bg-primary/5 border-primary/20 mb-3 rounded-lg border p-3">
      {/* ردیف اول: تعداد و دکمه بستن */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{selectedCount} سرنخ انتخاب شد</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 gap-1.5 px-3"
        >
          <X className="h-4 w-4" />
          لغو انتخاب
        </Button>
      </div>

      {/* ردیف دوم: اکشن‌ها - هر کدوم در یک خط جدا در موبایل */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <Select value="" onValueChange={onBulkStatusChange}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
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
          variant="outline"
          size="default"
          onClick={handleBulkExport}
          disabled={selectedLeads.length === 0}
          className="w-full gap-2 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          ذخیره مخاطبین ({selectedLeads.length})
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
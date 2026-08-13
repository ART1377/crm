// src/features/leads/components/table/bulk-actions-bar.tsx

'use client';

import { Download, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { downloadVCard } from '@/lib/utils';
import { LEAD_STATUSES } from '../../constants/leads-constants';

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
    selectedLeads.forEach((lead) => {
      downloadVCard(lead);
    });
  };

  return (
    <div className="bg-primary/5 border-primary/20 mb-3 flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="text-sm font-medium">{selectedCount} سرنخ</span>

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

      <Button variant="outline" size="sm" onClick={handleBulkExport} className="gap-1.5">
        <Download className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={onClearSelection} className="mr-auto">
        لغو انتخاب
      </Button>
    </div>
  );
}

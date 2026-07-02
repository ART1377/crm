"use client";

import { LEAD_STATUSES } from "@/constants/constants";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: string) => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onBulkStatusChange,
  onClearSelection,
}: BulkActionsBarProps) {
  return (
    <div className="bg-primary/5 border-primary/20 mb-3 flex items-center gap-3 rounded-lg border p-3">
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
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="mr-auto">
        لغو انتخاب
      </Button>
    </div>
  );
}

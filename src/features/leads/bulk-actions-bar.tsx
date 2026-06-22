"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES } from "@/lib/constants";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: string) => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedCount, onBulkStatusChange, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
      <span className="text-sm font-medium">{selectedCount} سرنخ انتخاب شد</span>
      <Select value="" onValueChange={onBulkStatusChange}>
        <SelectTrigger className="h-8 w-40"><SelectValue placeholder="تغییر وضعیت گروهی" /></SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="mr-auto">لغو انتخاب</Button>
    </div>
  );
}
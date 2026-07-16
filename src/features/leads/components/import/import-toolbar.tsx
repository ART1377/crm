'use client';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import type { BaladPlace } from './types';

interface ImportToolbarProps {
  places: BaladPlace[];
  selected: Set<string>;
  importing: boolean;
  onToggleAll: () => void;
  onImport: () => void;
  onImportOne: (place: BaladPlace) => void;
}

export function ImportToolbar({
  places,
  selected,
  importing,
  onToggleAll,
  onImport,
  onImportOne,
}: ImportToolbarProps) {
  const available = places.filter((p) => !p.isExisting);
  const allSelected = available.length > 0 && selected.size === available.length;

  return (
    <div className="flex items-center justify-between gap-4">
      <CardTitle className="text-sm font-medium">نتایج جستجو ({places.length})</CardTitle>
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
          انتخاب همه
        </label>
        <Button size="sm" disabled={selected.size === 0 || importing} onClick={onImport}>
          <Plus className="ml-2 h-4 w-4" />
          {importing ? 'در حال وارد کردن...' : `وارد کردن (${selected.size})`}
        </Button>
      </div>
    </div>
  );
}

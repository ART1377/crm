// src/features/leads/components/import/import-toolbar.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, RotateCcw, Search } from 'lucide-react';
import type { BaladPlace } from './types';

interface ImportToolbarProps {
  places: BaladPlace[];
  selected: Set<string>;
  importing: boolean;
  hiddenCount?: number;
  onToggleAll: () => void;
  onImport: () => void;
  onSearchChange: (query: string) => void;
  onToggleDuplicates: (show: boolean) => void;
  onShowHidden?: () => void;
  showDuplicates: boolean;
  showHidden?: boolean;
  searchQuery: string;
}

export function ImportToolbar({
  places,
  selected,
  importing,
  hiddenCount = 0,
  onToggleAll,
  onImport,
  onSearchChange,
  onToggleDuplicates,
  onShowHidden,
  showDuplicates,
  searchQuery,
}: ImportToolbarProps) {
  const available = places.filter((p) => !p.isExisting);
  const allSelected = available.length > 0 && selected.size === available.length;
  const duplicateCount = places.filter((p) => p.isExisting).length;

  return (
    <div className="space-y-3">
      {/* ردیف اول: عنوان + اقدامات */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span>نتایج جستجو</span>
          <Badge variant="secondary" className="text-xs">
            {places.length}
          </Badge>
          {duplicateCount > 0 && (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[10px] text-amber-700"
            >
              ⚠️ {duplicateCount} تکراری
            </Badge>
          )}
          {hiddenCount > 0 && (
            <Badge
              variant="outline"
              className="border-gray-200 bg-gray-50 text-[10px] text-gray-500"
            >
              👻 {hiddenCount} مخفی
            </Badge>
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          {/* دکمه نمایش مخفی‌ها */}
          {hiddenCount > 0 && onShowHidden && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHidden}
              className="h-8 gap-1.5 px-2.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              نمایش مخفی‌ها
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleDuplicates(!showDuplicates)}
            className="h-8 gap-1.5 px-2.5 text-xs"
          >
            {showDuplicates ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                مخفی‌کردن تکراری‌ها
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                نمایش تکراری‌ها
              </>
            )}
          </Button>

          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
            انتخاب همه
          </label>
        </div>
      </div>

      {/* ردیف دوم: جستجو در نتایج */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="جستجو در نتایج..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pr-10 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2"
          >
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>

      {/* ردیف سوم: دکمه ایمپورت */}
      <Button
        size="sm"
        className="w-full"
        disabled={selected.size === 0 || importing}
        onClick={onImport}
      >
        {importing ? 'در حال وارد کردن...' : `وارد کردن (${selected.size})`}
      </Button>
    </div>
  );
}

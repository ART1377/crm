// src/components/shared/multi-select.tsx
'use client';

import { Search, Tag, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string; color?: string }[];
  selectedValues: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

export function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  className,
  searchable = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const toggleOption = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(next.join(','));
  };

  const clearAll = () => {
    onChange('');
    setOpen(false);
    setSearch('');
  };

  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder || label;
    const names = selectedValues.map((v) => options.find((o) => o.value === v)?.label || v);
    return names.join('، ');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`min-h-8 w-full justify-start gap-2 ${className || ''}`}
        >
          <Tag className="h-4 w-4 shrink-0" />
          <span className="truncate">{getSelectedLabel()}</span>
          {selectedValues.length > 0 && (
            <>
              <span className="bg-primary text-primary-foreground ml-auto shrink-0 rounded-full px-1.5 text-[10px]">
                {selectedValues.length}
              </span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clearAll();
                  }
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit min-w-44 p-2" align="start">
        <div className="space-y-2">
          {/* Search input */}
          {searchable && (
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2" />
              <Input
                placeholder="جستجو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pr-7 text-sm"
              />
            </div>
          )}

          {/* Header with Clear All button */}
          {selectedValues.length > 0 && (
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-xs">
                {selectedValues.length} انتخاب شده
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 gap-1 px-2 text-xs text-red-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
                حذف همه
              </Button>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-sm">موردی یافت نشد</div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={() => toggleOption(option.value)}
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.color && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </label>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

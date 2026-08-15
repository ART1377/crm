// src/features/leads/components/import/industry-selector.tsx

'use client';

import { MultiSelect } from '@/components/shared/multi-select';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';
import { generateSearchKeywords } from './keywords/generator';

interface IndustrySelectorProps {
  selectedIndustries: string[];
  onChange: (industries: string[], keywords: string) => void;
  options: string[];
}

export function IndustrySelector({ selectedIndustries, onChange, options }: IndustrySelectorProps) {
  const handleChange = (values: string) => {
    // تبدیل رشته به آرایه
    const newIndustries = values ? values.split(',').filter(Boolean) : [];

    // اگر هیچ صنعتی انتخاب نشده، خالی برگردون
    if (newIndustries.length === 0) {
      onChange([], '');
      return;
    }

    // تولید کلیدواژه‌ها از همه صنایع انتخاب شده
    const allKeywords = newIndustries.flatMap((ind) => generateSearchKeywords({ keyword: ind }));
    // حذف تکراری‌ها
    const uniqueKeywords = [...new Set(allKeywords)];
    onChange(newIndustries, uniqueKeywords.join(', '));
  };

  // گزینه‌های MultiSelect
  const multiSelectOptions = options.map((opt) => ({
    value: opt,
    label: opt,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
            <Tag className="h-3.5 w-3.5 text-amber-600" />
          </div>
          صنایع
          <span className="text-muted-foreground text-[10px] font-normal">
            ({selectedIndustries.length} انتخاب شده)
          </span>
        </Label>
        <span className="text-muted-foreground text-[10px]">
          {selectedIndustries.length === 0 ? 'حداقل یک صنعت انتخاب کنید' : ''}
        </span>
      </div>

      <MultiSelect
        label="انتخاب صنایع..."
        options={multiSelectOptions}
        selectedValues={selectedIndustries}
        onChange={handleChange}
        placeholder="جستجو و انتخاب صنعت..."
        className="w-full"
      />

      {selectedIndustries.length > 1 && (
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          💡 {selectedIndustries.length} صنعت انتخاب شده → حدود {selectedIndustries.length * 10}+
          کلیدواژه تولید می‌شود
        </div>
      )}

      {selectedIndustries.length === 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠️ لطفاً حداقل یک صنعت را انتخاب کنید
        </div>
      )}
    </div>
  );
}

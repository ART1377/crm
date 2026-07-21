// src/features/leads/components/table/filters.tsx
'use client';

import { ArrowUpDown, RotateCcw, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { MultiSelect } from '@/components/shared/multi-select';
import { PersianDatePicker } from '@/components/shared/persian-date-picker';

import { useListOptions } from '@/features/settings/hooks/use-list-options';

import { LEAD_STATUSES } from '../../constants/leads-constants';

const hasActiveFilters = (
  filters: LeadsFiltersProps['filters'],
  sortBy: string,
  sortOrder: string
) =>
  filters.search ||
  filters.status ||
  filters.dateFrom ||
  filters.dateTo ||
  filters.industry ||
  filters.source ||
  sortBy !== 'createdAt' ||
  sortOrder !== 'desc';

interface LeadsFiltersProps {
  filters: {
    status: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    industry: string;
    source: string;
  };
  sortBy: string;
  sortOrder: string;
  onFilterChange: (
    field: 'status' | 'search' | 'dateFrom' | 'dateTo' | 'industry' | 'source',
    value: string
  ) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
}

export function LeadsFilters({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}: LeadsFiltersProps) {
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');
  const { data: sourceOptions = [] } = useListOptions('SOURCE');
  const showClear = hasActiveFilters(filters, sortBy, sortOrder);

  const selectedStatuses = filters.status ? filters.status.split(',').filter(Boolean) : [];
  const selectedSources = filters.source ? filters.source.split(',').filter(Boolean) : [];
  const selectedIndustries = filters.industry ? filters.industry.split(',').filter(Boolean) : [];

  const clearField = (field: keyof typeof filters) => {
    onFilterChange(field, '');
  };

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Row 1: Search + Status */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="جستجو..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pr-10 pl-10"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => clearField('search')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <MultiSelect
              label="وضعیت"
              options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              selectedValues={selectedStatuses}
              onChange={(v) => onFilterChange('status', v)}
              className="sm:w-48"
              searchable
            />
          </div>

          {/* Row 2: Source + Industry */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <MultiSelect
              label="منبع"
              options={sourceOptions.map((s) => ({ value: s.value, label: s.value }))}
              selectedValues={selectedSources}
              onChange={(v) => onFilterChange('source', v)}
              className="flex-1"
              searchable
            />

            <MultiSelect
              label="صنعت"
              options={industryOptions.map((s) => ({ value: s.value, label: s.value }))}
              selectedValues={selectedIndustries}
              onChange={(v) => onFilterChange('industry', v)}
              className="flex-1"
              searchable
            />
          </div>

          {/* Row 3: Sort + Date */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full gap-2 sm:w-auto">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-full sm:w-36">
                  <ArrowUpDown className="ml-2 h-4 w-4 shrink-0" />
                  <SelectValue placeholder="مرتب‌سازی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">تاریخ ثبت</SelectItem>
                  <SelectItem value="businessName">نام</SelectItem>
                  <SelectItem value="status">وضعیت</SelectItem>
                  <SelectItem value="industry">صنعت</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger className="w-full sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">نزولی</SelectItem>
                  <SelectItem value="asc">صعودی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full items-center gap-1.5 sm:flex-1">
              <div className="relative flex-1">
                <PersianDatePicker
                  value={filters.dateFrom}
                  onChange={(date) => onFilterChange('dateFrom', date)}
                  placeholder="از تاریخ"
                  className="w-full"
                />
                {filters.dateFrom && (
                  <button
                    type="button"
                    onClick={() => clearField('dateFrom')}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 left-1 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">تا</span>
              <div className="relative flex-1">
                <PersianDatePicker
                  value={filters.dateTo}
                  onChange={(date) => onFilterChange('dateTo', date)}
                  placeholder="تا تاریخ"
                  className="w-full"
                />
                {filters.dateTo && (
                  <button
                    type="button"
                    onClick={() => clearField('dateTo')}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 left-1 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {showClear && (
            <Button
              variant="destructive"
              size="lg"
              onClick={onClearFilters}
              className="w-full gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              بازنشانی همه فیلترها
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

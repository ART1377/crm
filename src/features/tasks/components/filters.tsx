// src/features/tasks/components/filters.tsx

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';

const DUE_DATE_FILTERS = [
  { value: 'all', label: 'همه' },
  { value: 'today', label: 'امروز' },
  { value: 'week', label: 'این هفته' },
  { value: 'month', label: 'این ماه' },
  { value: 'overdue', label: 'دیرکرد' },
] as const;

const STATUS_FILTERS = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'completed', label: 'انجام شده' },
] as const;

interface TaskFiltersProps {
  filters: {
    status: string;
    dueDate: string;
    search: string;
    sortBy: string;
    sortOrder: string;
    overdueDays: string;
  };
  counts: {
    all: number;
    pending: number;
    completed: number;
    overdue: number;
    today: number;
    week: number;
    month: number;
  };
  onFilterChange: (field: string, value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  filters,
  counts,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' || filters.dueDate !== 'all' || Boolean(filters.search);

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Tabs - تاریخ با اسکرول افقی */}
          <div className="relative">
            {/* سایه‌های نشان‌دهنده قابلیت اسکرول */}
            <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-2 bg-linear-to-l to-transparent" />
            <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-2 bg-linear-to-r to-transparent" />

            <div className="scrollbar-thumb-muted-foreground/20 scrollbar-thin scrollbar-track-transparent overflow-x-auto pb-1">
              <Tabs
                dir="rtl"
                value={filters.dueDate}
                onValueChange={(value) => onFilterChange('dueDate', value)}
                className="w-full"
              >
                <TabsList className="bg-muted/50 inline-flex h-auto w-full min-w-fit gap-1 rounded-lg p-1">
                  {DUE_DATE_FILTERS.map((filter) => (
                    <TabsTrigger
                      key={filter.value}
                      value={filter.value}
                      className="shrink-0 px-3 py-1.5 text-xs data-[state=active]:bg-white"
                    >
                      {filter.label}
                      {counts[filter.value as keyof typeof counts] !== undefined && (
                        <Badge variant="secondary" className="mr-1.5 h-5 px-1.5 text-[10px]">
                          {counts[filter.value as keyof typeof counts]}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Row 1: Search + Status */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="جستجو در تسک‌ها..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pr-10 pl-10"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => onFilterChange('search', '')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                    {counts[filter.value as keyof typeof counts] !== undefined && (
                      <span className="text-muted-foreground mr-1 text-xs">
                        ({counts[filter.value as keyof typeof counts]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Sort */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={filters.sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-full">
                <ArrowUpDown className="ml-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">تاریخ سررسید</SelectItem>
                <SelectItem value="createdAt">تاریخ ایجاد</SelectItem>
                <SelectItem value="title">عنوان</SelectItem>
                <SelectItem value="lead.businessName">نام سرنخ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">صعودی</SelectItem>
                <SelectItem value="desc">نزولی</SelectItem>
              </SelectContent>
            </Select>

            {filters.dueDate === 'overdue' && (
              <Select
                value={filters.overdueDays}
                onValueChange={(v) => onFilterChange('overdueDays', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="روز دیرکرد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="1">بیشتر از ۱ روز</SelectItem>
                  <SelectItem value="3">بیشتر از ۳ روز</SelectItem>
                  <SelectItem value="7">بیشتر از ۷ روز</SelectItem>
                  <SelectItem value="10">بیشتر از ۱۰ روز</SelectItem>
                  <SelectItem value="14">بیشتر از ۱۴ روز</SelectItem>
                  <SelectItem value="21">بیشتر از ۲۱ روز</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {hasActiveFilters && (
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

"use client";

import { ArrowUpDown, Calendar, Filter, Search, Tag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ComboboxInput } from "@/components/shared/combobox-input";
import { PersianDatePicker } from "@/components/shared/persian-date-picker";

import { useListOptions } from "@/hooks/use-list-options";

import { LEAD_STATUSES } from "@/lib/constants";

interface LeadsFiltersProps {
  filters: { status: string; search: string; dateFrom: string; dateTo: string; industry: string };
  sortBy: string;
  sortOrder: string;
  onFilterChange: (
    field: "status" | "search" | "dateFrom" | "dateTo" | "industry",
    value: string
  ) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
}

const STATUS_FILTERS = [{ value: "", label: "همه" }, ...LEAD_STATUSES] as const;

const hasActiveFilters = (
  filters: LeadsFiltersProps["filters"],
  sortBy: string,
  sortOrder: string
) =>
  filters.search ||
  filters.status ||
  filters.dateFrom ||
  filters.dateTo ||
  filters.industry ||
  sortBy !== "createdAt" ||
  sortOrder !== "desc";

export function LeadsFilters({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}: LeadsFiltersProps) {
  const { data: industryOptions = [] } = useListOptions("INDUSTRY");
  const industries = industryOptions.map((o) => o.value);
  const showClear = hasActiveFilters(filters, sortBy, sortOrder);

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Row 1: Search + Status + Industry */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="جستجو..."
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                className="pr-10 pl-10"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => onFilterChange("search", "")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="ml-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent className="w-fit">
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full sm:w-44">
              <ComboboxInput
                value={filters.industry}
                onChange={(value) => onFilterChange("industry", value)}
                options={industries}
                placeholder="صنعت"
                className="cursor-pointer"
                icon={<Tag className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Row 2: Sort + Date */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full gap-2 sm:w-auto sm:flex-1">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-full sm:w-36 sm:flex-1">
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
                <SelectTrigger className="w-full sm:w-28 sm:flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">نزولی</SelectItem>
                  <SelectItem value="asc">صعودی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full items-center gap-1.5 sm:flex-1">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <PersianDatePicker
                value={filters.dateFrom}
                onChange={(date) => onFilterChange("dateFrom", date)}
                placeholder="از تاریخ"
                className="flex-1"
              />
              <span className="text-muted-foreground shrink-0 text-xs">تا</span>
              <PersianDatePicker
                value={filters.dateTo}
                onChange={(date) => onFilterChange("dateTo", date)}
                placeholder="تا تاریخ"
                className="flex-1"
              />
            </div>
          </div>
          {showClear && (
            <Button
              variant="destructive"
              size="lg"
              onClick={onClearFilters}
              className="w-full gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              حذف فیلترها
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

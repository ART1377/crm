"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, ArrowUpDown, Calendar, RotateCcw } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";

interface LeadsFiltersProps {
  filters: { status: string; search: string; dateFrom: string; dateTo: string };
  sortBy: string;
  sortOrder: string;
  onFilterChange: (field: "status" | "search" | "dateFrom" | "dateTo", value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
}

const STATUS_FILTERS = [
  { value: "", label: "همه وضعیت‌ها" },
  ...LEAD_STATUSES,
] as const;

const hasActiveFilters = (filters: LeadsFiltersProps["filters"]) =>
  filters.search || filters.status || filters.dateFrom || filters.dateTo;

export function LeadsFilters({
  filters,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}: LeadsFiltersProps) {
  const showClear = hasActiveFilters(filters);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full sm:w-40">
              <ArrowUpDown className="ml-2 h-4 w-4" />
              <SelectValue placeholder="مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">تاریخ ثبت</SelectItem>
              <SelectItem value="businessName">نام کسب‌وکار</SelectItem>
              <SelectItem value="status">وضعیت</SelectItem>
              <SelectItem value="industry">صنعت</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">نزولی</SelectItem>
              <SelectItem value="asc">صعودی</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="ml-2 h-4 w-4" />
              <SelectValue placeholder="فیلتر وضعیت" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange("dateFrom", e.target.value)}
              className="w-full sm:w-36 text-xs"
              placeholder="از تاریخ"
            />
            <span className="text-muted-foreground text-sm">تا</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange("dateTo", e.target.value)}
              className="w-full sm:w-36 text-xs"
              placeholder="تا تاریخ"
            />
          </div>

          {showClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-destructive gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              حذف فیلترها
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
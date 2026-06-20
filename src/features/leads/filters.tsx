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
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  Calendar,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";

interface LeadsFiltersProps {
  filters: { status: string; search: string; dateFrom: string; dateTo: string };
  sortBy: string;
  sortOrder: string;
  onFilterChange: (
    field: "status" | "search" | "dateFrom" | "dateTo",
    value: string,
  ) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
}

const STATUS_FILTERS = [{ value: "", label: "همه" }, ...LEAD_STATUSES] as const;

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
        <div className="space-y-3">
          {/* Row 1: Search + Status (side by side on md+) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
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
                  className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select
              value={filters.status}
              onValueChange={(v) => onFilterChange("status", v)}
            >
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
          </div>

          {/* Row 2: Sort + Date + Clear */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-2 w-full sm:w-auto sm:flex-1">
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

            <div className="flex items-center gap-1.5 w-full sm:flex-1">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange("dateFrom", e.target.value)}
                className="flex-1 text-xs px-2"
              />
              <span className="text-muted-foreground text-xs shrink-0">تا</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange("dateTo", e.target.value)}
                className="flex-1 text-xs px-2"
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

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";

interface LeadsFiltersProps {
  filters: {
    status: string;
    search: string;
  };
  onFilterChange: (field: "status" | "search", value: string) => void;
}

const STATUS_FILTERS = [
  { value: "", label: "همه وضعیت‌ها" },
  ...LEAD_STATUSES,
] as const;

export function LeadsFilters({ filters, onFilterChange }: LeadsFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در نام کسب‌وکار، شخص تماس یا شماره..."
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
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-45">
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
        </div>
      </CardContent>
    </Card>
  );
}

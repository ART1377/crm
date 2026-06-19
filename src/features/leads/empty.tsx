import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";

interface LeadsEmptyStateProps {
  hasFilters: boolean;
}

export function LeadsEmptyState({ hasFilters }: LeadsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-lg font-medium">سرنخی پیدا نشد</p>
      <p className="text-sm mt-1">
        {hasFilters
          ? "با فیلترهای فعلی سرنخی یافت نشد"
          : "هنوز هیچ سرنخی ثبت نکرده‌اید"}
      </p>
      {!hasFilters && (
        <Link href="/leads/new" className="mt-4">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            افزودن اولین سرنخ
          </Button>
        </Link>
      )}
    </div>
  );
}

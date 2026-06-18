import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function LeadsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">سرنخ‌ها</h1>
        <p className="text-muted-foreground mt-1">
          مدیریت و پیگیری سرنخ‌های فروش
        </p>
      </div>
      <Link href="/leads/new">
        <Button size="lg">
          <Plus className="ml-2 h-5 w-5" />
          افزودن سرنخ جدید
        </Button>
      </Link>
    </div>
  );
}

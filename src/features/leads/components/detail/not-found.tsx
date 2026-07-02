import Link from "next/link";

import { ROUTES } from "@/routes/routes";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <AlertCircle className="text-muted-foreground mb-4 h-16 w-16" />
      <h2 className="text-2xl font-bold">سرنخ پیدا نشد</h2>
      <p className="text-muted-foreground mt-2">این سرنخ وجود ندارد یا حذف شده است</p>

      <Link href={ROUTES.leads.list} className="mt-4">
        <Button>بازگشت به لیست سرنخ‌ها</Button>
      </Link>
    </div>
  );
}

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LeadFormActionsProps {
  onCancel: () => void;
  isPending: boolean;
}

export function LeadFormActions({ onCancel, isPending }: LeadFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        انصراف
      </Button>
      <Button type="submit" disabled={isPending}>
        <Save className="ml-2 h-4 w-4" />
        {isPending ? "در حال ذخیره..." : "ذخیره سرنخ"}
      </Button>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { LEAD_STATUSES } from "@/features/leads/constants/leads-constants";

import { cn } from "@/lib/utils";

interface StatusCardsProps {
  statusCounts: Record<string, number>;
}

export function StatusCards({ statusCounts }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
      {LEAD_STATUSES.map(({ value, label, color }) => {
        const count = statusCounts[value] ?? 0;
        return (
          <Card key={value} className="min-h-fit flex-1">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{count}</div>
              <Badge className={cn("mt-1 text-[10px]", color)}>{label}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
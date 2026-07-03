import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConversionCardProps {
  rate: number;
  customers: number;
  total: number;
}

export function ConversionCard({ rate, customers, total }: ConversionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="h-4 w-4 text-green-500" />
          نرخ تبدیل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{rate}%</div>
          <span className="text-muted-foreground text-xs">
            {customers} از {total} سرنخ
          </span>
        </div>
        <Progress value={rate} className="mt-3 h-2" />
      </CardContent>
    </Card>
  );
}

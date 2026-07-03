import { BarChart3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TasksProgressCardProps {
  progress: number;
  completed: number;
  pending: number;
}

export function TasksProgressCard({ progress, completed, pending }: TasksProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          تسک‌های امروز
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{progress}%</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {completed} انجام شده
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pending} در انتظار
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </CardContent>
    </Card>
  );
}

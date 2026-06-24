import Link from "next/link";

import { AlertCircle, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ROUTES } from "@/routes/routes";

import { useTodayTasks } from "@/hooks/use-tasks";

export function TodayTasks() {
  const { data: tasks = [], isLoading } = useTodayTasks();

  return (
    <Card className="min-h-fit flex-1 lg:flex-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          پیگیری‌های امروز
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="ml-2 h-5 w-5" />
            پیگیری‌ای برای امروز ندارید
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg bg-muted p-3"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.lead?.businessName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.isCompleted ? "secondary" : "default"}>
                    {task.isCompleted ? "انجام شد" : "در انتظار"}
                  </Badge>
                  <Link href={ROUTES.leads.detail(task.leadId)}>
                    <Button variant="outline" size="sm">مشاهده</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
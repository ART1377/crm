"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from "lucide-react";
import { useTodayTasks } from "@/hooks/use-tasks";
import { TaskItem } from "./item";
import { TasksSkeleton } from "./skeleton";

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTodayTasks();

  if (isLoading) return <TasksSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">تسک‌های امروز</h1>
        <p className="text-muted-foreground mt-1">
          پیگیری‌های سررسید شده امروز
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {tasks.length} تسک برای امروز
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="ml-2 h-5 w-5" />
              تسکی برای امروز ندارید
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

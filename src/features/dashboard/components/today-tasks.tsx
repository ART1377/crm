import Link from "next/link";

import { ROUTES } from "@/routes/routes";
import { ArrowLeft, Calendar, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useTodayTasks } from "@/features/tasks/hooks/use-tasks";

export function TodayTasks() {
  const { data: tasks = [], isLoading } = useTodayTasks();

  return (
    <Card className="border-border/60 min-h-fit flex-1 overflow-hidden lg:flex-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Calendar className="h-4 w-4 text-orange-500" />
            </div>
            پیگیری‌های امروز
          </CardTitle>
          {tasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tasks.length} تسک
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium">همه انجام شده</p>
            <p className="mt-1 text-xs">پیگیری‌ای برای امروز ندارید</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={ROUTES.leads.detail(task.leadId)}
                className="group hover:bg-muted/50 relative flex items-center gap-3 rounded-xl p-3 transition-all"
              >
                {/* Status indicator line */}
                <div
                  className={`absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-full ${
                    task.isCompleted ? "bg-green-400" : "bg-orange-400"
                  }`}
                />

                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    task.isCompleted ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      task.isCompleted ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.lead && (
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {task.lead.businessName}
                    </p>
                  )}
                </div>

                {/* Badge + Arrow */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={task.isCompleted ? "secondary" : "default"}
                    className="shrink-0 text-[10px] font-medium"
                  >
                    {task.isCompleted ? "انجام شد" : "در انتظار"}
                  </Badge>
                  <ArrowLeft className="text-muted-foreground h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

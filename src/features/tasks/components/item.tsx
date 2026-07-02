import Link from "next/link";

import { ROUTES } from "@/routes/routes";
import { CheckCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";

import type { Task } from "@/types/types";

export function TaskItem({ task }: { task: Task }) {
  const updateTask = useUpdateTask();

  return (
    <div className="bg-muted flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div
          onClick={() =>
            updateTask.mutate({ taskId: task.id, data: { isCompleted: !task.isCompleted } })
          }
          className="cursor-pointer"
        >
          {task.isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Clock className="h-6 w-6 text-orange-500" />
          )}
        </div>
        <div>
          <p className={task.isCompleted ? "text-muted-foreground line-through" : ""}>
            {task.title}
          </p>
          {task.lead && <p className="text-muted-foreground text-sm">{task.lead.businessName}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={task.isCompleted ? "secondary" : "default"}>
          {task.isCompleted ? "انجام شد" : "در انتظار"}
        </Badge>
        {task.lead && (
          <Link href={ROUTES.leads.detail(task.leadId)}>
            <Button variant="outline" size="sm">
              مشاهده
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

interface TaskSidebarProps {
  tasks: Task[];
  leadId: string;
}

export function TaskSidebar({ tasks, leadId }: TaskSidebarProps) {
  const updateTask = useUpdateTask();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteTask = useDeleteTask(leadId);

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    updateTask.mutate({ taskId, data: { isCompleted: !isCompleted } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          پیگیری‌ها
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            پیگیری‌ای ثبت نشده
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  task.isCompleted ? "bg-muted/50" : "bg-muted"
                }`}
              >
                <div
                  onClick={() => handleToggle(task.id, task.isCompleted)}
                  className="cursor-pointer"
                >
                  {task.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                  )}
                </div>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => handleToggle(task.id, task.isCompleted)}
                >
                  <p
                    className={`text-sm cursor-pointer ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(task.dueDate))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTask.mutate(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        title="حذف پیگیری"
        isPending={deleteTask.isPending}
      />
    </Card>
  );
}

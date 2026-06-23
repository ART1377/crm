"use client";

import { useState } from "react";

import type { Task } from "@/types";
import { Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

import { useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";

import { formatDate } from "@/lib/utils";

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
          <p className="text-muted-foreground py-4 text-center text-sm">پیگیری‌ای ثبت نشده</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                  task.isCompleted ? "bg-muted/50" : "bg-muted"
                }`}
              >
                <div
                  onClick={() => handleToggle(task.id, task.isCompleted)}
                  className="cursor-pointer"
                >
                  {task.isCompleted ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 shrink-0 text-orange-500" />
                  )}
                </div>
                <div
                  className="min-w-0 flex-1"
                  onClick={() => handleToggle(task.id, task.isCompleted)}
                >
                  <p
                    className={`cursor-pointer text-sm ${task.isCompleted ? "text-muted-foreground line-through" : ""}`}
                  >
                    {task.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
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
                  <Trash2 className="text-destructive h-3 w-3" />
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

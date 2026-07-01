"use client";

import { useState } from "react";

import type { Task } from "@/types";
import { AlertTriangle, Calendar, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DeleteConfirmDialog } from "@/components/shared/delete-dialog";

import { useDeleteAllTasks, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";

import { countOverdueTasks, formatDate } from "@/lib/utils";

import { EditTaskDialog } from "./edit-task-dialog";

export function TaskSidebar({ tasks, leadId }: { tasks: Task[]; leadId: string }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask(leadId);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const deleteAllTasks = useDeleteAllTasks(leadId);

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    updateTask.mutate({ taskId, data: { isCompleted: !isCompleted } });
  };

  const overdueCount = countOverdueTasks(tasks);

  const isOverdue = (task: Task) => {
    if (task.isCompleted) return false;
    return countOverdueTasks([task]) > 0;
  };

  return (
    <Card className={overdueCount > 0 ? "border-red-200 ring-1 ring-red-100" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            پیگیری‌ها
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {/* existing badges */}
            {tasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive bg-destructive/10 hover:bg-destructive/15 hover:text-destructive h-7 gap-1 text-xs"
                onClick={() => setShowDeleteAll(true)}
              >
                <Trash2 className="h-3 w-3" />
                حذف همه
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">پیگیری‌ای ثبت نشده</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-lg p-2.5 transition-all ${
                    overdue
                      ? "border border-red-200 bg-red-50/70 shadow-sm"
                      : task.isCompleted
                        ? "bg-muted/30"
                        : "bg-muted/80 hover:bg-muted"
                  }`}
                >
                  {/* Status icon - not clickable */}
                  <div className="shrink-0">
                    {overdue ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : task.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${overdue ? "font-semibold text-red-800" : task.isCompleted ? "text-muted-foreground line-through" : "font-medium"}`}
                    >
                      {task.title}
                    </p>
                    <p
                      className={`text-xs ${overdue ? "font-medium text-red-500" : "text-muted-foreground"}`}
                    >
                      {overdue
                        ? `گذشته از موعد - ${formatDate(new Date(task.dueDate))}`
                        : formatDate(new Date(task.dueDate))}
                    </p>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-50 hover:opacity-100"
                    onClick={() => handleToggle(task.id, task.isCompleted)}
                  >
                    {task.isCompleted ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-orange-400" />
                    )}
                  </Button>
                  <EditTaskDialog task={task}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-50 hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </EditTaskDialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(task.id);
                    }}
                  >
                    <Trash2 className="text-destructive h-3 w-3" />
                  </Button>
                </div>
              );
            })}
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
      <DeleteConfirmDialog
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={() => {
          deleteAllTasks.mutate();
          setShowDeleteAll(false);
        }}
        title="حذف همه پیگیری‌ها"
        description="آیا از حذف تمام پیگیری‌های این سرنخ اطمینان دارید؟"
        isPending={deleteAllTasks.isPending}
      />
    </Card>
  );
}

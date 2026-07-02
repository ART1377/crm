"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PersianDatePicker } from "@/components/shared/persian-date-picker";

import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";

import { editTaskSchema } from "@/lib/validations";

import type { Task } from "@/types/types";

type EditTaskFormData = z.infer<typeof editTaskSchema>;

export function EditTaskDialog({ task, children }: { task: Task; children: React.ReactNode }) {
  const updateTask = useUpdateTask();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      dueDate: task.dueDate.split("T")[0],
    },
  });

  const onSubmit = async (data: EditTaskFormData) => {
    await updateTask.mutateAsync({ taskId: task.id, data });
    setOpen(false);
  };

  return (
    <Dialog key={task.id} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش پیگیری</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>تاریخ پیگیری</Label>
            <PersianDatePicker
              value={watch("dueDate")}
              onChange={(date) => setValue("dueDate", date)}
            />
            {errors.dueDate && <p className="text-destructive text-sm">{errors.dueDate.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={updateTask.isPending}>
            {updateTask.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

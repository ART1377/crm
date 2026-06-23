"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useCreateTask } from "@/hooks/use-tasks";

interface ScheduleTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  children: React.ReactNode;
}

export function ScheduleTaskDialog({
  open,
  onOpenChange,
  leadId,
  children,
}: ScheduleTaskDialogProps) {
  const createTask = useCreateTask();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async () => {
    await createTask.mutateAsync({ leadId, data: { title, dueDate } });
    onOpenChange(false);
    setTitle("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ایجاد یادآوری پیگیری</DialogTitle>
          <DialogDescription>تاریخ و عنوان پیگیری را مشخص کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="عنوان پیگیری *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !dueDate}>
            ایجاد یادآوری
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

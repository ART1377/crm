import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "عنوان تسک الزامی است"),
  dueDate: z.string().min(1, "تاریخ پیگیری الزامی است"),
});

export const editTaskSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  dueDate: z.string().min(1, "تاریخ الزامی است"),
});
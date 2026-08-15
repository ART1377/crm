import { z } from 'zod';

export const editTaskSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  dueDate: z.string().min(1, 'تاریخ الزامی است'),
});

export type EditTaskFormData = z.infer<typeof editTaskSchema>;

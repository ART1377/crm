// src/features/templates/schemas/templates-schemas.ts

import { z } from 'zod';

export const templateSchema = z.object({
  title: z.string().min(1, 'عنوان قالب الزامی است'),
  content: z.string().min(1, 'متن پیام الزامی است'),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

import { z } from 'zod';

export const templateSchema = z.object({
  title: z.string().min(1, 'عنوان قالب الزامی است'),
  content: z.string().min(1, 'متن پیام الزامی است'),
  type: z.enum(['WHATSAPP', 'SMS', 'ETA', 'BALE', 'RUBIKA']),
  purpose: z.string().min(1, 'نوع قالب الزامی است'),
});

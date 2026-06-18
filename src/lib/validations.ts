// src/lib/validations.ts
import { z } from 'zod'

export const leadSchema = z.object({
  businessName: z.string().min(2, 'نام کسب‌وکار الزامی است'),
  contactPerson: z.string().optional(),
  phoneNumber: z.string().min(10, 'شماره تماس معتبر نیست'),
  secondaryPhone: z.string().optional(),
  industry: z.string().min(1, 'حوزه فعالیت الزامی است'),
  source: z.string().default('DIRECT'),
  status: z.string().default('NEW'),
  notes: z.string().optional(),
})

export const activitySchema = z.object({
  type: z.enum(['CALL', 'MESSAGE', 'NOTE', 'STATUS_CHANGE']),
  summary: z.string().min(1, 'خلاصه فعالیت الزامی است'),
  detail: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'عنوان تسک الزامی است'),
  dueDate: z.string().min(1, 'تاریخ پیگیری الزامی است'),
})

export const templateSchema = z.object({
  title: z.string().min(1, 'عنوان قالب الزامی است'),
  content: z.string().min(1, 'متن پیام الزامی است'),
  type: z.enum(['WHATSAPP', 'SMS', 'ETA', 'BALE', 'RUBIKA']),
})
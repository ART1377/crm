// src/app/api/tasks/bulk-update/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { OVERDUE_DAYS } from '@/constants/constants';

import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const { ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'حداقل یک تسک باید انتخاب شود' }, { status: 400 });
    }

    const isCompleting = data.isCompleted === true;

    // ۱. بروزرسانی وضعیت همه تسک‌ها
    const updated = await prisma.task.updateMany({
      where: { id: { in: ids } },
      data: {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    // ۲. اگر «انجام شده» بود، برای هر تسک مناسب، تسک پیگیری بساز
    let followUpCreated = 0;

    if (isCompleting) {
      // تسک‌ها را با اطلاعات سرنخ بگیر
      const tasks = await prisma.task.findMany({
        where: { id: { in: ids } },
        include: {
          lead: {
            select: { id: true, status: true },
          },
        },
      });

      // فقط تسک‌هایی که سرنخشون در وضعیت MESSAGED یا FOLLOW_UP هست
      const tasksNeedingFollowUp = tasks.filter(
        (t) => t.lead && ['MESSAGED', 'FOLLOW_UP'].includes(t.lead.status)
      );

      // ساخت تسک پیگیری (با بررسی تکراری نبودن)
      const followUpResults = await Promise.all(
        tasksNeedingFollowUp.map(async (task) => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + OVERDUE_DAYS);

          const title = task.lead!.status === 'MESSAGED' ? 'پیگیری پیام' : 'پیگیری وضعیت';

          // ✅ بازه‌ی روز مورد نظر (بدون mutate کردن dueDate)
          const startOfDay = new Date(dueDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(dueDate);
          endOfDay.setHours(23, 59, 59, 999);

          // چک تکراری
          const existing = await prisma.task.findFirst({
            where: {
              leadId: task.leadId,
              title,
              dueDate: {
                gte: startOfDay,
                lt: endOfDay,
              },
              isCompleted: false,
            },
          });

          if (existing) return null;

          return prisma.task.create({
            data: {
              leadId: task.leadId,
              title,
              dueDate,
            },
          });
        })
      );

      followUpCreated = followUpResults.filter(Boolean).length;
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.count,
      followUpCreated,
    });
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی گروهی' }, { status: 500 });
  }
}

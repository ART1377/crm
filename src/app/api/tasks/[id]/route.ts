// src/app/api/tasks/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { OVERDUE_DAYS } from '@/constants/constants';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Prisma.TaskUpdateInput = {};

    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
      updateData.completedAt = body.isCompleted ? new Date() : null;
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        lead: true, // برای دسترسی به leadId و وضعیت سرنخ
      },
    });

    // ✅ اگر تسک انجام شده و وضعیت سرنخ در حالت‌های خاص هست، تسک جدید بساز
    if (body.isCompleted === true) {
      const lead = await prisma.lead.findUnique({
        where: { id: task.leadId },
        select: { status: true },
      });

      // اگر وضعیت سرنخ CALLED, MESSAGED, یا FOLLOW_UP باشه
      if (lead && ['CALLED', 'MESSAGED', 'FOLLOW_UP'].includes(lead.status)) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + OVERDUE_DAYS);

        // عنوان تسک بر اساس وضعیت سرنخ
        let title = 'پیگیری';
        if (lead.status === 'CALLED') title = 'پیگیری تماس';
        else if (lead.status === 'MESSAGED') title = 'پیگیری پیام';
        else if (lead.status === 'FOLLOW_UP') title = 'پیگیری وضعیت';

        // چک کن که آیا تسک جدیدی برای این تاریخ وجود داره یا نه
        const existingTask = await prisma.task.findFirst({
          where: {
            leadId: task.leadId,
            title: title,
            dueDate: {
              gte: new Date(dueDate.setHours(0, 0, 0, 0)),
              lt: new Date(dueDate.setHours(23, 59, 59, 999)),
            },
            isCompleted: false,
          },
        });

        // اگر تسک جدید وجود نداشت، ایجاد کن
        if (!existingTask) {
          await prisma.task.create({
            data: {
              leadId: task.leadId,
              title,
              dueDate,
            },
          });
        }
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی تسک' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'خطا در حذف تسک' }, { status: 500 });
  }
}

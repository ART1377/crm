// src/app/api/tasks/bulk-update/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const { ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'حداقل یک تسک باید انتخاب شود' }, { status: 400 });
    }

    const updated = await prisma.task.updateMany({
      where: { id: { in: ids } },
      data: {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: updated.count,
    });
  } catch {
    return NextResponse.json({ error: 'خطا در بروزرسانی گروهی' }, { status: 500 });
  }
}

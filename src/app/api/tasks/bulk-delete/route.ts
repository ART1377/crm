// src/app/api/tasks/bulk-delete/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'حداقل یک تسک باید انتخاب شود' }, { status: 400 });
    }

    const deleted = await prisma.task.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: `${deleted.count} تسک با موفقیت حذف شد`,
    });
  } catch (error) {
    console.error('Bulk delete tasks error:', error);
    return NextResponse.json({ error: 'خطا در حذف گروهی تسک‌ها' }, { status: 500 });
  }
}

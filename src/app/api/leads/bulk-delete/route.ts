// src/app/api/leads/bulk-delete/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'حداقل یک سرنخ باید انتخاب شود' }, { status: 400 });
    }

    // بررسی وجود سرنخ‌ها
    const existingLeads = await prisma.lead.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existingLeads.length === 0) {
      return NextResponse.json({ error: 'سرنخی پیدا نشد' }, { status: 404 });
    }

    // حذف گروهی (با cascade حذف activities و tasks)
    const deleted = await prisma.lead.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: `${deleted.count} سرنخ با موفقیت حذف شد`,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'خطا در حذف گروهی سرنخ‌ها' }, { status: 500 });
  }
}

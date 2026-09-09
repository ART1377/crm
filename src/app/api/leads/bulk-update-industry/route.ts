// src/app/api/leads/bulk-update-industry/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const { ids, industry } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'حداقل یک سرنخ باید انتخاب شود' }, { status: 400 });
    }

    if (!industry) {
      return NextResponse.json({ error: 'صنعت جدید مشخص نشده است' }, { status: 400 });
    }

    const updated = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { industry },
    });

    return NextResponse.json({
      success: true,
      updatedCount: updated.count,
      message: `${updated.count} سرنخ با موفقیت به‌روزرسانی شد`,
    });
  } catch (error) {
    console.error('Bulk update industry error:', error);
    return NextResponse.json({ error: 'خطا در تغییر صنعت گروهی' }, { status: 500 });
  }
}

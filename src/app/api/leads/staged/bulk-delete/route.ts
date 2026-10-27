// src/app/api/leads/staged/bulk-delete/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body?.ids ?? [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'شناسه‌ای ارسال نشده' }, { status: 400 });
    }

    const result = await prisma.stagedLead.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (e) {
    console.error('bulk-delete staged error:', e);
    return NextResponse.json({ error: 'خطا در حذف گروهی' }, { status: 500 });
  }
}

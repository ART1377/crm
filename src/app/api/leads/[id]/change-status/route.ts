// src/app/api/leads/[id]/change-status/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { OVERDUE_DAYS } from '@/constants/constants';

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';

import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, previousStatus } = body;

    const newLabel = LEAD_STATUSES.find((s) => s.value === status)?.label || status;
    const oldLabel = previousStatus
      ? LEAD_STATUSES.find((s) => s.value === previousStatus)?.label || previousStatus
      : null;

    // Update lead status
    await prisma.lead.update({ where: { id }, data: { status } });

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: id,
        type: 'STATUS_CHANGE',
        summary: oldLabel
          ? `تغییر وضعیت از "${oldLabel}" به "${newLabel}"`
          : `تغییر وضعیت به "${newLabel}"`,
      },
    });

    // ✅ Auto-create follow-up task for CALLED, MESSAGED, and FOLLOW_UP
    if (status === 'CALLED' || status === 'MESSAGED' || status === 'FOLLOW_UP') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + OVERDUE_DAYS); // NOW 25 days (changed in constants)

      // تعیین عنوان مناسب بر اساس وضعیت
      let title = 'پیگیری';
      if (status === 'CALLED') title = 'پیگیری تماس';
      else if (status === 'MESSAGED') title = 'پیگیری پیام';
      else if (status === 'FOLLOW_UP') title = 'پیگیری وضعیت';

      await prisma.task.create({
        data: {
          leadId: id,
          title,
          dueDate,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/leads/[id]/change-status error:', error);
    return NextResponse.json({ error: 'خطا در تغییر وضعیت' }, { status: 400 });
  }
}

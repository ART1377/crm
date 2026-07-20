// src/app/api/leads/merge/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lead1Id, lead2Id } = await request.json();

    const [lead1, lead2] = await Promise.all([
      prisma.lead.findUnique({ where: { id: lead1Id } }),
      prisma.lead.findUnique({ where: { id: lead2Id } }),
    ]);

    if (!lead1 || !lead2) {
      return NextResponse.json({ error: 'سرنخ پیدا نشد' }, { status: 404 });
    }

    // Move activities and tasks to lead1
    await Promise.all([
      prisma.activity.updateMany({ where: { leadId: lead2Id }, data: { leadId: lead1Id } }),
      prisma.task.updateMany({ where: { leadId: lead2Id }, data: { leadId: lead1Id } }),
    ]);

    // Merge notes
    const mergedNotes = [
      lead1.notes,
      `[ادغام از: ${lead2.businessName} - ${lead2.phoneNumber}]`,
      lead2.notes,
    ]
      .filter(Boolean)
      .join('\n');

    // Update lead1 with merged data
    await prisma.lead.update({
      where: { id: lead1Id },
      data: {
        notes: mergedNotes,
        contactPerson: lead1.contactPerson || lead2.contactPerson,
        secondaryPhone: lead1.secondaryPhone || lead2.secondaryPhone,
      },
    });

    // Delete lead2
    await prisma.lead.delete({ where: { id: lead2Id } });

    return NextResponse.json({ success: true, mergedInto: lead1Id });
  } catch (error) {
    console.error('Merge error:', error);
    return NextResponse.json({ error: 'خطا در ادغام' }, { status: 500 });
  }
}

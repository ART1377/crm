// src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { sanitizePhone } from '@/lib/sanitize';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'سرنخ پیدا نشد' }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Prisma.LeadUpdateInput = {};

    if (body.businessName !== undefined) updateData.businessName = body.businessName;
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = sanitizePhone(body.phoneNumber);
    if (body.secondaryPhone !== undefined)
      updateData.secondaryPhone = body.secondaryPhone ? sanitizePhone(body.secondaryPhone) : null;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.channels !== undefined) updateData.channels = body.channels;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('PATCH /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // اول چک کن وجود داره
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'سرنخ پیدا نشد' }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'سرنخ با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'خطا در حذف سرنخ' }, { status: 500 });
  }
}

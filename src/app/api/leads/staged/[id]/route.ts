// src/app/api/leads/staged/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stagedLead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const staged = await prisma.stagedLead.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(staged);
  } catch {
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 500 });
  }
}

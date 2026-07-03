// src/app/api/leads/[id]/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tasks = await prisma.task.findMany({
      where: { leadId: id },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/leads/[id]/tasks error:', error);
    return NextResponse.json({ error: 'خطا در دریافت تسک‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'سرنخ پیدا نشد' }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        leadId: id,
        title: body.title,
        dueDate: new Date(body.dueDate),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads/[id]/tasks error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد تسک' }, { status: 400 });
  }
}

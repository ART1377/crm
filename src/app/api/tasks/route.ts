// src/app/api/tasks/route.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dueDate = searchParams.get('dueDate');
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search');
    const overdueDays = searchParams.get('overdueDays');

    const where: Prisma.TaskWhereInput = {};

    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'pending') {
      where.isCompleted = false;
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (dueDate === 'today') {
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: today, lte: end };
    } else if (dueDate === 'week') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (dueDate === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (dueDate === 'overdue') {
      where.dueDate = { lt: today };
      where.isCompleted = false;
      if (overdueDays) {
        const days = parseInt(overdueDays);
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        where.dueDate = { lt: cutoff };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { lead: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            phoneNumber: true,
            contactPerson: true,
            secondaryPhone: true,
            industry: true,
            notes: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'خطا در دریافت تسک‌ها' }, { status: 500 });
  }
}

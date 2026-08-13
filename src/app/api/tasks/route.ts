// src/app/api/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'completed' | 'pending' | 'all'
    const dueDate = searchParams.get('dueDate'); // 'today' | 'week' | 'month' | 'overdue' | 'all'
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search');

    const where: Prisma.TaskWhereInput = {};

    // فیلتر وضعیت
    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'pending') {
      where.isCompleted = false;
    }

    // فیلتر تاریخ
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
    }

    // جستجو
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

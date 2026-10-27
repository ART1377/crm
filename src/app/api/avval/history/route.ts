// src/app/api/avval/history/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// GET: دریافت لیست تاریخچه
export async function GET() {
  try {
    const history = await prisma.avvalSearchHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // حداکثر ۵۰ مورد اخیر
    });
    return NextResponse.json({ history });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// POST: ثبت یک جستجوی جدید
export async function POST(req: NextRequest) {
  try {
    const { slug, industry, count, pages } = await req.json();

    if (!slug || !industry) {
      return NextResponse.json({ error: 'slug و industry الزامی است' }, { status: 400 });
    }

    // upsert: اگر قبلاً همین slug+industry بود، به‌روزرسانی کن
    const existing = await prisma.avvalSearchHistory.findFirst({
      where: { slug, industry },
    });

    if (existing) {
      const updated = await prisma.avvalSearchHistory.update({
        where: { id: existing.id },
        data: {
          count,
          pages,
          lastSearchedAt: new Date(),
          searchCount: { increment: 1 },
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.avvalSearchHistory.create({
      data: { slug, industry, count, pages },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// DELETE: حذف یک مورد یا همه
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await prisma.avvalSearchHistory.deleteMany({});
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'id الزامی است' }, { status: 400 });
    }

    await prisma.avvalSearchHistory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

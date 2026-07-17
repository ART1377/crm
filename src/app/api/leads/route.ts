// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;
    const sortBy = (searchParams.get('sortBy') as string) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as string) || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: Prisma.LeadWhereInput = {};

    if (status && status !== 'all') where.status = status;
    if (industry) where.industry = industry;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { contactPerson: { contains: search } },
        { phoneNumber: { contains: search } },
      ];
    }

    // Date filtering
    if (dateFrom || dateTo) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (dateFrom) createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        createdAt.lte = endDate;
      }
      where.createdAt = createdAt;
    }

    // Validate sortBy to prevent injection
    const allowedSortFields = ['createdAt', 'businessName', 'status', 'industry'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: limit,
        include: {
          _count: { select: { activities: true, tasks: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      hasMore: skip + leads.length < total,
    });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: 'خطا در دریافت سرنخ‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for duplicate phone number
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [{ phoneNumber: body.phoneNumber }, { businessName: body.businessName }],
      },
    });

    if (existing) {
      const field = existing.phoneNumber === body.phoneNumber ? 'شماره تماس' : 'نام کسب‌وکار';
      return NextResponse.json(
        { error: `${field} قبلاً ثبت شده است (${existing.businessName})` },
        { status: 409 }
      );
    }
    const sanitize = (str: string) => (str || '').replace(/\u200C/g, ' ').trim();

    const lead = await prisma.lead.create({
      data: {
        businessName: body.businessName,
        contactPerson: body.contactPerson || null,
        phoneNumber: body.phoneNumber,
        secondaryPhone: body.secondaryPhone || null,
        industry: sanitize(body.industry),
        source: body.source || null,
        notes: body.notes || null,
        status: 'NEW',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد سرنخ' }, { status: 400 });
  }
}

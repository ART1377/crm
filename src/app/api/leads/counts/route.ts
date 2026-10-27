// src/app/api/leads/counts/route.ts

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// helper: ساخت where از query string
function buildWhere(searchParams: URLSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  const status = searchParams.get('status');
  if (status) {
    const list = status.split(',').filter(Boolean);
    where.status = list.length === 1 ? list[0] : { in: list };
  }

  const industry = searchParams.get('industry');
  if (industry) {
    const list = industry.split(',').filter(Boolean);
    where.industry = list.length === 1 ? list[0] : { in: list };
  }

  const source = searchParams.get('source');
  if (source) {
    const list = source.split(',').filter(Boolean);
    where.source = list.length === 1 ? list[0] : { in: list };
  }

  const search = searchParams.get('search');
  if (search) {
    where.OR = [
      { businessName: { contains: search } },
      { contactPerson: { contains: search } },
      { phoneNumber: { contains: search } },
    ];
  }

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  return where;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseWhere = buildWhere(searchParams);

    // ✅ برای هر فیلتر، where را بدون خودش می‌سازیم
    const whereWithoutStatus = buildWhere(
      new URLSearchParams([...searchParams.entries()].filter(([k]) => k !== 'status'))
    );
    const whereWithoutIndustry = buildWhere(
      new URLSearchParams([...searchParams.entries()].filter(([k]) => k !== 'industry'))
    );
    const whereWithoutSource = buildWhere(
      new URLSearchParams([...searchParams.entries()].filter(([k]) => k !== 'source'))
    );

    const [byIndustry, byStatus, bySource] = await Promise.all([
      prisma.lead.groupBy({
        by: ['industry'],
        where: whereWithoutIndustry,
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        where: whereWithoutStatus,
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where: whereWithoutSource,
        _count: { id: true },
      }),
    ]);

    const toRecord = <T extends string>(
      rows: { _count: { id: number } }[],
      key: (row: any) => T | null
    ) => {
      const out: Record<string, number> = {};
      for (const row of rows) {
        const k = key(row);
        if (k) out[k] = row._count.id;
      }
      return out;
    };

    return NextResponse.json({
      industryCounts: toRecord(byIndustry, (r) => r.industry),
      statusCounts: toRecord(byStatus, (r) => r.status),
      sourceCounts: toRecord(bySource, (r) => r.source),
      total: await prisma.lead.count({ where: baseWhere }), // ✅ اختیاری: تعداد کل با همه فیلترها
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

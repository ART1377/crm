// src/app/api/leads/staged/counts/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

function buildWhere(searchParams: URLSearchParams): any {
  const where: any = { status: 'PENDING' };

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
      { businessName: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const whereWithoutIndustry = buildWhere(
      new URLSearchParams([...searchParams.entries()].filter(([k]) => k !== 'industry'))
    );
    const whereWithoutSource = buildWhere(
      new URLSearchParams([...searchParams.entries()].filter(([k]) => k !== 'source'))
    );

    const [byIndustry, bySource] = await Promise.all([
      prisma.stagedLead.groupBy({
        by: ['industry'],
        where: whereWithoutIndustry,
        _count: { id: true },
      }),
      prisma.stagedLead.groupBy({
        by: ['source'],
        where: whereWithoutSource,
        _count: { id: true },
      }),
    ]);

    const industryCounts: Record<string, number> = {};
    for (const row of byIndustry) {
      if (row.industry) industryCounts[row.industry] = row._count.id;
    }

    const sourceCounts: Record<string, number> = {};
    for (const row of bySource) {
      if (row.source) sourceCounts[row.source] = row._count.id;
    }

    return NextResponse.json({ industryCounts, sourceCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

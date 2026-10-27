// src/app/api/leads/staged/counts/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ✅ هر دو groupBy را موازی اجرا کن (فقط PENDING)
    const [byIndustry, bySource] = await Promise.all([
      prisma.stagedLead.groupBy({
        by: ['industry'],
        where: { status: 'PENDING' },
        _count: { id: true },
      }),
      prisma.stagedLead.groupBy({
        by: ['source'],
        where: { status: 'PENDING' },
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

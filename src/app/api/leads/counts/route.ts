// src/app/api/leads/counts/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ✅ هر سه groupBy را موازی اجرا کن
    const [byIndustry, byStatus, bySource] = await Promise.all([
      prisma.lead.groupBy({
        by: ['industry'],
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
      }),
    ]);

    const industryCounts: Record<string, number> = {};
    for (const row of byIndustry) {
      if (row.industry) industryCounts[row.industry] = row._count.id;
    }

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus) {
      if (row.status) statusCounts[row.status] = row._count.id;
    }

    const sourceCounts: Record<string, number> = {};
    for (const row of bySource) {
      if (row.source) sourceCounts[row.source] = row._count.id;
    }

    return NextResponse.json({ industryCounts, statusCounts, sourceCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

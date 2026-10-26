// src/app/api/leads/staged/counts/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // شمارش به تفکیک صنعت (فقط PENDING)
    const byIndustry = await prisma.stagedLead.groupBy({
      by: ['industry'],
      where: { status: 'PENDING' },
      _count: { id: true },
    });

    const industryCounts: Record<string, number> = {};
    for (const row of byIndustry) {
      if (row.industry) {
        industryCounts[row.industry] = row._count.id;
      }
    }

    return NextResponse.json({ industryCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

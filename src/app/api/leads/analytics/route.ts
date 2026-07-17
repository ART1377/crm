// src/app/api/leads/analytics/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Status by industry
    const industryStats = await prisma.lead.groupBy({
      by: ['industry', 'status'],
      _count: { id: true },
      orderBy: { industry: 'asc' },
    });

    const sourceByIndustry = await prisma.lead.groupBy({
      by: ['source', 'industry'],
      _count: { id: true },
      orderBy: [{ source: 'asc' }, { _count: { id: 'desc' } }],
    });

    // Weekly activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await prisma.activity.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyActivity: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyActivity[key] = 0;
    }

    for (const activity of recentActivities) {
      const key = activity.createdAt.toISOString().split('T')[0];
      if (dailyActivity[key] !== undefined) {
        dailyActivity[key]++;
      }
    }

    return NextResponse.json({
      industryStats,
      sourceByIndustry,
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
    });
  } catch {
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Status by industry
    const industryStats = await prisma.lead.groupBy({
      by: ['industry', 'status'],
      _count: { id: true },
      orderBy: { industry: 'asc' },
    });

    // Weekly activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await prisma.activity.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    });

    // Daily activity count for last 7 days
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
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
    });
  } catch {
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 });
  }
}

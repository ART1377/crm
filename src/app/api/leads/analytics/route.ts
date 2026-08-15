// src/app/api/leads/analytics/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Status by industry
    const industryStats = await prisma.lead.groupBy({
      by: ['industry', 'status'],
      _count: { id: true },
      orderBy: { industry: 'asc' },
    });

    // 2. Source by industry
    const sourceByIndustry = await prisma.lead.groupBy({
      by: ['source', 'industry'],
      _count: { id: true },
      orderBy: [{ source: 'asc' }, { _count: { id: 'desc' } }],
    });

    // 3. Source by industry AND status
    const sourceByIndustryAndStatus = await prisma.lead.groupBy({
      by: ['source', 'industry', 'status'],
      _count: { id: true },
      orderBy: [{ industry: 'asc' }, { status: 'asc' }, { source: 'asc' }],
    });

    // ✅ 4. جدید: نرخ تبدیل بر اساس منبع
    const sourceConversionStats = await prisma.lead.groupBy({
      by: ['source', 'status'],
      _count: { id: true },
      orderBy: [{ source: 'asc' }, { status: 'asc' }],
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
      sourceByIndustryAndStatus,
      sourceConversionStats, // ✅ جدید
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 });
  }
}

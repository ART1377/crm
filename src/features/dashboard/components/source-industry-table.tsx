'use client';

import ReactECharts from 'echarts-for-react';
import { Link2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SourceIndustryTableProps {
  data: { source: string; industry: string; _count: { id: number } }[];
}

export function SourceIndustryTable({ data }: SourceIndustryTableProps) {
  if (!data.length) return null;

  // Group by source
  const grouped: Record<string, Record<string, number>> = {};
  const allIndustries = new Set<string>();

  for (const item of data) {
    const source = item.source || 'نامشخص';
    if (!grouped[source]) grouped[source] = {};
    grouped[source][item.industry] = item._count.id;
    allIndustries.add(item.industry);
  }

  const sources = Object.keys(grouped).sort((a, b) => {
    const aTotal = Object.values(grouped[a]).reduce((sum, v) => sum + v, 0);
    const bTotal = Object.values(grouped[b]).reduce((sum, v) => sum + v, 0);
    return bTotal - aTotal;
  });

  const industries = [...allIndustries].sort();
  const colors = [
    '#3b82f6',
    '#8b5cf6',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
    '#f97316',
    '#14b8a6',
    '#6366f1',
    '#84cc16',
    '#d946ef',
  ];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { fontFamily: 'Vazirmatn, sans-serif', fontSize: 11 },
    },
    legend: {
      data: sources,
      bottom: 0,
      textStyle: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: 10,
        color: 'hsl(var(--foreground))',
      },
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      type: 'scroll',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: sources.length > 3 ? '18%' : '12%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: industries,
      axisLabel: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: 10,
        rotate: 30,
        color: 'hsl(var(--muted-foreground))',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: 10,
      },
    },
    series: sources.map((source, i) => ({
      name: source,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      itemStyle: { color: colors[i % colors.length], borderRadius: 4 },
      data: industries.map((industry) => grouped[source]?.[industry] ?? 0),
    })),
  };

  return (
    <Card className="min-h-fit flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Link2 className="h-4 w-4 text-blue-500" />
          </div>
          سرنخ‌ها بر اساس منبع و صنعت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 400 }} />
      </CardContent>
    </Card>
  );
}

'use client';

import { useMemo, useState } from 'react';

import { useLeadsAnalytics, useLeadsStats } from '@/features/dashboard/hooks/use-dashboard';
import { useTodayTasks } from '@/features/tasks/hooks/use-tasks';

export function useDashboardData() {
  const { data: stats, isLoading: statsLoading } = useLeadsStats();
  const { data: analytics } = useLeadsAnalytics();
  const { data: todayTasks = [], isLoading: tasksLoading } = useTodayTasks();
  const [industrySortBy, setIndustrySortBy] = useState<string>('total');
  const [industrySortDirection, setIndustrySortDirection] = useState<'asc' | 'desc'>('desc');

  const isLoading = statsLoading || tasksLoading;

  const total = stats?.total ?? 0;
  const newLeads = stats?.newLeads ?? 0;
  const activeLeads = (stats?.called ?? 0) + (stats?.followedUp ?? 0) + (stats?.messaged ?? 0);
  const customers = stats?.customers ?? 0;

  const conversionRate = total > 0 ? Math.round((customers / total) * 100) : 0;

  const pendingTasks = todayTasks.filter((t) => !t.isCompleted).length;
  const completedTasks = todayTasks.filter((t) => t.isCompleted).length;
  const taskProgress =
    todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0;

  const industryMap: Record<string, Record<string, number>> = {};
  for (const item of analytics?.industryStats ?? []) {
    if (!industryMap[item.industry]) industryMap[item.industry] = {};
    industryMap[item.industry][item.status] = item._count.id;
  }

  const industryPieData = Object.entries(industryMap).map(([name, statuses]) => ({
    name,
    value: Object.values(statuses).reduce((a, b) => a + b, 0),
  }));

  // محاسبه تعداد هر استاتوس از industryStats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of analytics?.industryStats ?? []) {
      counts[item.status] = (counts[item.status] ?? 0) + item._count.id;
    }
    return counts;
  }, [analytics?.industryStats]);

  const sortedIndustryEntries = useMemo(() => {
    return Object.entries(industryMap).sort(([, a], [, b]) => {
      const aTotal = Object.values(a).reduce((sum, v) => sum + v, 0);
      const bTotal = Object.values(b).reduce((sum, v) => sum + v, 0);

      const aValue = industrySortBy === 'total' ? aTotal : (a[industrySortBy] ?? 0);
      const bValue = industrySortBy === 'total' ? bTotal : (b[industrySortBy] ?? 0);

      return industrySortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [industryMap, industrySortBy, industrySortDirection]);

  const handleIndustrySort = (column: string) => {
    if (industrySortBy === column) {
      // اگه روی همون ستون کلیک کرد، جهت رو برعکس کن
      setIndustrySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      // اگه ستون جدید انتخاب کرد، پیش‌فرض نزولی
      setIndustrySortBy(column);
      setIndustrySortDirection('desc');
    }
  };

  return {
    isLoading,
    stats: { total, newLeads, activeLeads, customers },
    conversionRate,
    taskProgress,
    pendingTasks,
    completedTasks,
    industryMap,
    industryPieData,
    todayTasks,
    dailyActivity: analytics?.dailyActivity ?? [],
    statusCounts,
    sortedIndustryEntries,
    industrySortBy,
    setIndustrySortBy: handleIndustrySort,
    industrySortDirection,
  };
}

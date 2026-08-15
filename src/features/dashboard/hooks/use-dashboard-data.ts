// src/features/dashboard/hooks/use-dashboard-data.ts

import { useLeadsAnalytics, useLeadsStats } from '@/features/dashboard/hooks/use-dashboard';
import { useTodayTasks } from '@/features/tasks/hooks/use-tasks';
import { useMemo, useState } from 'react';
import { buildIndustryMap, prepareConversionData } from '../utils/dashboard-utils';

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

  const sourceByIndustry = analytics?.sourceByIndustry ?? [];
  const sourceByIndustryAndStatus = analytics?.sourceByIndustryAndStatus ?? [];
  const sourceConversionStats = analytics?.sourceConversionStats ?? [];
  const dailyActivity = analytics?.dailyActivity ?? [];

  const industryMap = useMemo(
    () => buildIndustryMap(analytics?.industryStats ?? []),
    [analytics?.industryStats]
  );

  const industryPieData = useMemo(() => {
    return Object.entries(industryMap).map(([name, statuses]) => ({
      name,
      value: Object.values(statuses).reduce((a, b) => a + b, 0),
    }));
  }, [industryMap]);

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

  const conversionData = useMemo(
    () => prepareConversionData(sourceConversionStats),
    [sourceConversionStats]
  );

  const handleIndustrySort = (column: string) => {
    if (industrySortBy === column) {
      setIndustrySortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
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
    industryPieData,
    dailyActivity,
    statusCounts,
    sortedIndustryEntries,
    industrySortBy,
    setIndustrySortBy: handleIndustrySort,
    industrySortDirection,
    sourceByIndustry,
    sourceByIndustryAndStatus,
    conversionData,
    totalLeads: total,
  };
}

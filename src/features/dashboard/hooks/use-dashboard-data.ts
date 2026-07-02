"use client";

import { useLeadsAnalytics, useLeadsStats } from "@/features/dashboard/hooks/use-dashboard";
import { useTodayTasks } from "@/features/tasks/hooks/use-tasks";

export function useDashboardData() {
  const { data: stats, isLoading: statsLoading } = useLeadsStats();
  const { data: analytics } = useLeadsAnalytics();
  const { data: todayTasks = [], isLoading: tasksLoading } = useTodayTasks();

  const isLoading = statsLoading || tasksLoading;

  const total = stats?.total ?? 0;
  const newLeads = stats?.newLeads ?? 0;
  const activeLeads = stats?.active ?? 0;
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
  };
}
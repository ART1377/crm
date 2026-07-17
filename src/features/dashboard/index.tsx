'use client';

import Link from 'next/link';

import { ROUTES } from '@/routes/routes';
import { Building2, Phone, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import { StatCard } from './components/card';
import { ConversionCard } from './components/conversion-card';
import { IndustryChart } from './components/industry-chart';
import { IndustryTable } from './components/industry-table';
import { DashboardSkeleton } from './components/skeleton';
import { StatusCards } from './components/status-cards';
import { TasksProgressCard } from './components/tasks-progress-card';
import { WeeklyCalendar } from './components/weekly-chart';
import { useDashboardData } from './hooks/use-dashboard-data';
import { SourceIndustryTable } from './components/source-industry-table';

export function DashboardPage() {
  const {
    isLoading,
    stats,
    conversionRate,
    taskProgress,
    pendingTasks,
    completedTasks,
    industryPieData,
    dailyActivity,
    statusCounts,
    sortedIndustryEntries,
    industrySortBy,
    setIndustrySortBy,
    industrySortDirection,
    sourceByIndustry,
  } = useDashboardData();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="داشبورد"
          description="خلاصه‌ای از وضعیت سرنخ‌ها و فعالیت‌های امروز"
          actions={
            <Link href={ROUTES.leads.new}>
              <Button size="lg">
                <Plus className="ml-2 h-5 w-5" />
                افزودن سرنخ جدید
              </Button>
            </Link>
          }
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="کل سرنخ‌ها" value={stats.total} subtitle="تعداد کل" icon={Users} />
        <StatCard
          title="جدید"
          value={stats.newLeads}
          subtitle="در انتظار تماس"
          icon={Plus}
          iconColor="text-blue-500"
        />
        <StatCard
          title="در حال پیگیری"
          value={stats.activeLeads}
          subtitle="تماس و مذاکره"
          icon={Phone}
          iconColor="text-orange-500"
        />
        <StatCard
          title="مشتریان"
          value={stats.customers}
          subtitle="تبدیل شده"
          icon={Building2}
          iconColor="text-green-500"
        />
      </div>

      <StatusCards statusCounts={statusCounts} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ConversionCard rate={conversionRate} customers={stats.customers} total={stats.total} />
        <TasksProgressCard
          progress={taskProgress}
          completed={completedTasks}
          pending={pendingTasks}
        />
      </div>

      <WeeklyCalendar data={dailyActivity} />

      <div className="grid gap-4 lg:grid-cols-2">
        <IndustryTable
          entries={sortedIndustryEntries}
          sortBy={industrySortBy}
          sortDirection={industrySortDirection}
          onSortChange={setIndustrySortBy}
        />
        <IndustryChart data={industryPieData} />
      </div>

      <SourceIndustryTable data={sourceByIndustry} />
    </PageWrapper>
  );
}

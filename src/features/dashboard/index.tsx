"use client";

import Link from "next/link";

import { ROUTES } from "@/routes/routes";
import { BarChart3, Building2, Phone, PieChart, Plus, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { useLeadsAnalytics, useLeadsStats } from "./hooks/use-dashboard";
import { useTodayTasks } from "@/features/tasks/hooks/use-tasks";

import { StatCard } from "./components/card";
import { IndustryChart } from "./components/industry-chart";
import { DashboardSkeleton } from "./components/skeleton";
import { TodayTasks } from "./components/today-tasks";
import { WeeklyCalendar } from "./components/weekly-chart";

export function DashboardPage() {
  const { data: stats, isLoading } = useLeadsStats();
  const { data: analytics } = useLeadsAnalytics();
  const { data: todayTasks = [] } = useTodayTasks();

  if (isLoading) return <DashboardSkeleton />;

  const total = stats?.total ?? 0;
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
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="کل سرنخ‌ها" value={total} subtitle="تعداد کل" icon={Users} />
        <StatCard
          title="جدید"
          value={stats?.newLeads ?? 0}
          subtitle="در انتظار تماس"
          icon={Plus}
          iconColor="text-blue-500"
        />
        <StatCard
          title="در حال پیگیری"
          value={stats?.active ?? 0}
          subtitle="تماس و مذاکره"
          icon={Phone}
          iconColor="text-orange-500"
        />
        <StatCard
          title="مشتریان"
          value={customers}
          subtitle="تبدیل شده"
          icon={Building2}
          iconColor="text-green-500"
        />
      </div>

      {/* Conversion + Task Progress */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-500" />
              نرخ تبدیل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <span className="text-muted-foreground text-xs">
                {customers} از {total} سرنخ
              </span>
            </div>
            <Progress value={conversionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              تسک‌های امروز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{taskProgress}%</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {completedTasks} انجام شده
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {pendingTasks} در انتظار
                </Badge>
              </div>
            </div>
            <Progress value={taskProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <WeeklyCalendar data={analytics?.dailyActivity ?? []} />

      {/* Industry Table + Pie */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PieChart className="h-4 w-4 text-purple-500" />
              وضعیت بر اساس صنعت
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">صنعت</TableHead>
                  <TableHead className="text-center">کل</TableHead>
                  <TableHead className="text-center">مشتری</TableHead>
                  <TableHead className="text-center">شماره گرفت</TableHead>
                  <TableHead className="text-center">پیام گذاشتم</TableHead>
                  <TableHead className="text-center">جدید</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(industryMap).map(([industry, statuses]) => {
                  const total = Object.values(statuses).reduce((a, b) => a + b, 0);
                  return (
                    <TableRow key={industry}>
                      <TableCell className="font-medium">{industry}</TableCell>
                      <TableCell className="text-center">{total}</TableCell>
                      <TableCell className="text-center">{statuses.CUSTOMER ?? 0}</TableCell>
                      <TableCell className="text-center">{statuses.CALLED ?? 0}</TableCell>
                      <TableCell className="text-center">{statuses.MESSAGED ?? 0}</TableCell>
                      <TableCell className="text-center">{statuses.NEW ?? 0}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <IndustryChart data={industryPieData} />
      </div>

      <TodayTasks />
    </PageWrapper>
  );
}

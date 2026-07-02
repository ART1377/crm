"use client";

import Link from "next/link";

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


import { useDashboardData } from "./hooks/use-dashboard-data";
import { DashboardSkeleton } from "./components/skeleton";
import { ROUTES } from "@/routes/routes";
import { StatCard } from "./components/card";
import { LEAD_STATUSES } from "../leads/constants/leads-constants";
import { WeeklyCalendar } from "./components/weekly-chart";
import { IndustryChart } from "./components/industry-chart";
import { TodayTasks } from "./components/today-tasks";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const {
    isLoading,
    stats,
    conversionRate,
    taskProgress,
    pendingTasks,
    completedTasks,
    industryMap,
    industryPieData,
    dailyActivity,
    statusCounts,
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
                <Plus className="ml-2 h-5 w-5" />افزودن سرنخ جدید
              </Button>
            </Link>
          }
        />
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="کل سرنخ‌ها" value={stats.total} subtitle="تعداد کل" icon={Users} />
        <StatCard title="جدید" value={stats.newLeads} subtitle="در انتظار تماس" icon={Plus} iconColor="text-blue-500" />
        <StatCard title="در حال پیگیری" value={stats.activeLeads} subtitle="تماس و مذاکره" icon={Phone} iconColor="text-orange-500" />
        <StatCard title="مشتریان" value={stats.customers} subtitle="تبدیل شده" icon={Building2} iconColor="text-green-500" />
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {LEAD_STATUSES.map(({ value, label, color }) => {
          const count = statusCounts[value] ?? 0;
          return (
            <Card key={value} className="min-h-fit flex-1">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold">{count}</div>
                <Badge className={cn("mt-1 text-[10px]", color)}>{label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversion + Task Progress */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-500" />نرخ تبدیل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <span className="text-xs text-muted-foreground">{stats.customers} از {stats.total} سرنخ</span>
            </div>
            <Progress value={conversionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-blue-500" />تسک‌های امروز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{taskProgress}%</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{completedTasks} انجام شده</Badge>
                <Badge variant="outline" className="text-xs">{pendingTasks} در انتظار</Badge>
              </div>
            </div>
            <Progress value={taskProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <WeeklyCalendar data={dailyActivity} />

      {/* Industry Table + Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-h-fit flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PieChart className="h-4 w-4 text-purple-500" />وضعیت بر اساس صنعت
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
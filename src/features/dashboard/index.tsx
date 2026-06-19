"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Phone, Building2 } from "lucide-react";
import { useLeadsStats } from "@/hooks/use-leads";
import { StatCard } from "./card";
import { DashboardSkeleton } from "./skeleton";
import { TodayTasks } from "./today-tasks";
import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

export function DashboardPage() {
  const { data: stats, isLoading } = useLeadsStats();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="داشبورد"
          description="خلاصه‌ای از وضعیت سرنخ‌ها و فعالیت‌های امروز"
          actions={
            <Link href="/leads/new">
              <Button size="lg">
                <Plus className="ml-2 h-5 w-5" />
                افزودن سرنخ جدید
              </Button>
            </Link>
          }
        />
      }
    >
      <div className="gap-4 flex flex-col lg:flex-row flex-1 lg:flex-none">
        <StatCard
          title="کل سرنخ‌ها"
          value={stats?.total ?? 0}
          subtitle="تعداد کل"
          icon={Users}
        />
        <StatCard
          title="سرنخ‌های جدید"
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
          value={stats?.customers ?? 0}
          subtitle="تبدیل شده"
          icon={Building2}
          iconColor="text-green-500"
        />
      </div>
      <TodayTasks />
    </PageWrapper>
  );
}

import Link from "next/link";

import { ROUTES } from "@/routes/routes";
import { Building2, Phone, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { useLeadsStats } from "@/hooks/use-leads";

import { StatCard } from "./card";
import { DashboardSkeleton } from "./skeleton";
import { TodayTasks } from "./today-tasks";

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
      <div className="flex flex-1 flex-col gap-4 lg:flex-none lg:flex-row">
        <StatCard title="کل سرنخ‌ها" value={stats?.total ?? 0} subtitle="تعداد کل" icon={Users} />
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

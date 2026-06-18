// src/features/dashboard/dashboard-view.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLeads } from '@/hooks/use-leads'
import { StatCard } from './card'
import { DashboardSkeleton } from './skeleton'
import { Users, Phone, Building2 } from 'lucide-react'
import { TodayTasks } from './today-tasks'

export function DashboardPage() {
  const { data: leads = [], isLoading } = useLeads()

  if (isLoading) return <DashboardSkeleton />

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'NEW').length,
    activeLeads: leads.filter(l => ['CONTACTED', 'FOLLOW_UP', 'NEGOTIATION'].includes(l.status)).length,
    customers: leads.filter(l => l.status === 'CUSTOMER').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-muted-foreground mt-1">
            خلاصه‌ای از وضعیت سرنخ‌ها و فعالیت‌های امروز
          </p>
        </div>
        <Link href="/leads/new">
          <Button size="lg">
            <Plus className="ml-2 h-5 w-5" />
            افزودن سرنخ جدید
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="کل سرنخ‌ها" value={stats.totalLeads} subtitle="تعداد کل" icon={Users} />
        <StatCard title="سرنخ‌های جدید" value={stats.newLeads} subtitle="در انتظار تماس" icon={Plus} iconColor="text-blue-500" />
        <StatCard title="در حال پیگیری" value={stats.activeLeads} subtitle="تماس و مذاکره" icon={Phone} iconColor="text-orange-500" />
        <StatCard title="مشتریان" value={stats.customers} subtitle="تبدیل شده" icon={Building2} iconColor="text-green-500" />
      </div>

      <TodayTasks />
    </div>
  )
}
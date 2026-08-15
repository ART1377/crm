// src/features/dashboard/components/tasks-overview.tsx

'use client';

import { AlertCircle, Calendar, CheckCircle2, Clock, ListTodo, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useAllTasks } from '@/features/tasks/hooks/use-tasks';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/routes';

export function TasksOverview() {
  const { data: allTasks = [], isLoading } = useAllTasks({ status: 'all', dueDate: 'all' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });
  }, [allTasks, today]);

  const total = allTasks.length;
  const pending = allTasks.filter((t) => !t.isCompleted).length;
  const completed = allTasks.filter((t) => t.isCompleted).length;
  const overdue = allTasks.filter((t) => !t.isCompleted && new Date(t.dueDate) < new Date()).length;

  const todayTasksList = todayTasks.slice(0, 3);
  const hasMoreToday = todayTasks.length > 3;

  if (isLoading) return <TasksOverviewSkeleton />;

  return (
    <Card className="col-span-full min-h-fit">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <ListTodo className="h-4 w-4 text-blue-500" />
          </div>
          تسک‌ها و پیگیری‌ها
        </CardTitle>
        <Link href="/tasks">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            مشاهده همه <span className="text-muted-foreground text-[10px]">({total})</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatItem
            label="کل تسک‌ها"
            value={total}
            icon={ListTodo}
            color="text-blue-500"
            bgColor="bg-blue-50"
            href="/tasks"
          />
          <StatItem
            label="در انتظار"
            value={pending}
            icon={Clock}
            color="text-orange-500"
            bgColor="bg-orange-50"
            href="/tasks?status=pending"
          />
          <StatItem
            label="انجام شده"
            value={completed}
            icon={CheckCircle2}
            color="text-green-500"
            bgColor="bg-green-50"
            href="/tasks?status=completed"
          />
          <StatItem
            label="دیرکرد"
            value={overdue}
            icon={AlertCircle}
            color="text-red-500"
            bgColor="bg-red-50"
            href="/tasks?dueDate=overdue"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span>پیگیری‌های امروز</span>
              <Badge variant="secondary" className="text-[10px]">
                {todayTasks.length}
              </Badge>
            </div>
            {todayTasks.length > 0 && (
              <Link href="/tasks?dueDate=today">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  مشاهده همه
                </Button>
              </Link>
            )}
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className="mt-2 text-sm font-medium">همه انجام شده</p>
              <p className="text-muted-foreground text-xs">پیگیری‌ای برای امروز ندارید</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasksList.map((task) => {
                const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
                return (
                  <Link
                    key={task.id}
                    href={ROUTES.leads.detail(task.leadId)}
                    className="group hover:bg-muted/50 flex items-center gap-3 rounded-xl p-3 transition-all"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        task.isCompleted
                          ? 'bg-green-50 text-green-600'
                          : isOverdue
                            ? 'bg-red-50 text-red-600'
                            : 'bg-blue-50 text-blue-600'
                      )}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isOverdue ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm',
                          task.isCompleted && 'text-muted-foreground line-through'
                        )}
                      >
                        {task.title}
                      </p>
                      {task.lead && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {task.lead.businessName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.isCompleted ? 'secondary' : isOverdue ? 'destructive' : 'default'
                        }
                        className="text-[10px]"
                      >
                        {task.isCompleted ? 'انجام شده' : isOverdue ? 'دیرکرد' : 'در انتظار'}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
              {hasMoreToday && (
                <Link href="/tasks?dueDate=today">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    + {todayTasks.length - 3} تسک دیگر
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href?: string;
}

function StatItem({ label, value, icon: Icon, color, bgColor, href }: StatItemProps) {
  const content = (
    <div className="hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 rounded-lg border p-3 transition-all">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bgColor)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-muted-foreground text-[10px]">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function TasksOverviewSkeleton() {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
        <Skeleton className="mb-3 h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="mb-2 h-16 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

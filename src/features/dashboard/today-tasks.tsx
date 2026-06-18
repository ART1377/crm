// src/features/dashboard/today-tasks.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, AlertCircle } from 'lucide-react'
import { useTodayTasks } from '@/hooks/use-tasks'

export function TodayTasks() {
  const { data: tasks = [], isLoading } = useTodayTasks()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          پیگیری‌های امروز
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="ml-2 h-5 w-5" />
            پیگیری‌ای برای امروز ندارید
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.lead?.businessName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.isCompleted ? 'secondary' : 'default'}>
                    {task.isCompleted ? 'انجام شد' : 'در انتظار'}
                  </Badge>
                  <Link href={`/leads/${task.leadId}`}>
                    <Button variant="outline" size="sm">مشاهده</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
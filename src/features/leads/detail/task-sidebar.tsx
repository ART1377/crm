'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { useUpdateTask } from '@/hooks/use-tasks'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskSidebarProps {
  tasks: Task[]
  leadId: string
}

export function TaskSidebar({ tasks }: TaskSidebarProps) {
  const updateTask = useUpdateTask()

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    updateTask.mutate({ taskId, data: { isCompleted: !isCompleted } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          پیگیری‌ها
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">پیگیری‌ای ثبت نشده</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  task.isCompleted ? 'bg-muted/50' : 'bg-muted'
                }`}
                onClick={() => handleToggle(task.id, task.isCompleted)}
              >
                {task.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(new Date(task.dueDate))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
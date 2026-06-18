'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { useUpdateTask } from '@/hooks/use-tasks'
import type { Task } from '@/types'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const updateTask = useUpdateTask()

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <div
          onClick={() => updateTask.mutate({ taskId: task.id, data: { isCompleted: !task.isCompleted } })}
          className="cursor-pointer"
        >
          {task.isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Clock className="h-6 w-6 text-orange-500" />
          )}
        </div>
        <div>
          <p className={task.isCompleted ? 'line-through text-muted-foreground' : ''}>
            {task.title}
          </p>
          {task.lead && (
            <p className="text-sm text-muted-foreground">{task.lead.businessName}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={task.isCompleted ? 'secondary' : 'default'}>
          {task.isCompleted ? 'انجام شد' : 'در انتظار'}
        </Badge>
        {task.lead && (
          <Link href={`/leads/${task.leadId}`}>
            <Button variant="outline" size="sm">مشاهده</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
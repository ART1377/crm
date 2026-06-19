// src/hooks/use-tasks.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksService } from '@/services/tasks.service'
import type { CreateTaskData, UpdateTaskData } from '@/types'
import toast from 'react-hot-toast'
import { LEADS_QUERY_KEY, TASKS_QUERY_KEY } from '@/lib/query-keys'

export function useTasks(leadId: string) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, leadId],
    queryFn: () => tasksService.getByLeadId(leadId),
    enabled: !!leadId,
  })
}

export function useTodayTasks() {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'today'],
    queryFn: () => tasksService.getTodayTasks(),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateTaskData }) =>
      tasksService.create(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] })
      toast.success('تسک با موفقیت ایجاد شد')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskData }) =>
      tasksService.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] })
      toast.success('وضعیت تسک بروزرسانی شد')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
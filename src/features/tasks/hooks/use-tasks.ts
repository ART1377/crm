// src/features/tasks/hooks/use-tasks.ts

'use client';

import toast from 'react-hot-toast';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksService } from '@/features/tasks/api/tasks.api';

import { LEADS_QUERY_KEY, TASKS_QUERY_KEY } from '@/lib/query-keys';

import { CreateTaskData } from '../types/tasks-types';

export function useAllTasks(filters: {
  status?: string;
  dueDate?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'all', filters],
    queryFn: () => tasksService.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'today'],
    queryFn: () => tasksService.getTodayTasks(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateTaskData }) =>
      tasksService.create(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success('تسک با موفقیت ایجاد شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { isCompleted?: boolean; title?: string; dueDate?: string };
    }) => tasksService.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success('تسک بروزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('تسک حذف شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAllTasks(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tasksService.deleteAll(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success('همه پیگیری‌ها حذف شدند');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => tasksService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('تسک‌ها با موفقیت حذف شدند');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در حذف گروهی');
    },
  });
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: { isCompleted: boolean } }) =>
      tasksService.bulkUpdate(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('وضعیت تسک‌ها بروزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

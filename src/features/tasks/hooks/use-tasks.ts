"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tasksService } from "@/features/tasks/api/tasks.api";

import { LEADS_QUERY_KEY, TASKS_QUERY_KEY } from "@/lib/query-keys";

import { CreateTaskData } from "../types/tasks-types";

export function useTasks(leadId: string) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, leadId],
    queryFn: () => tasksService.getByLeadId(leadId),
    enabled: !!leadId,
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, "today"],
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
      toast.success("تسک با موفقیت ایجاد شد");
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
      toast.success("تسک بروزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTask(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success("پیگیری حذف شد");
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
      toast.success("همه پیگیری‌ها حذف شدند");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

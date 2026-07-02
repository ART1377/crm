// src/hooks/use-templates.ts
"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { templatesService } from "@/features/templates/api/templates.api";

import { TEMPLATES_QUERY_KEY } from "@/lib/query-keys";

import type { MessageTemplate } from "@/types/types";

export function useTemplates() {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: () => templatesService.getAll(),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string; type: string; purpose: string }) =>
      templatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("قالب پیام ایجاد شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageTemplate> }) =>
      templatesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("قالب پیام بروزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      toast.success("قالب پیام حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

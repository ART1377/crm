"use client";

import toast from "react-hot-toast";

import apiClient from "@/config/axios";
import type { CreateActivityData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { activitiesService } from "@/services/activities.service";

import { LEADS_QUERY_KEY } from "@/lib/query-keys";

export function useCreateActivity(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => activitiesService.create(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success("فعالیت ثبت شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteActivity(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => apiClient.delete(`/activities/${activityId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success("فعالیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

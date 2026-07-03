'use client';

import toast from 'react-hot-toast';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { activitiesService } from '@/features/leads/api/activities.api';

import { LEADS_QUERY_KEY } from '@/lib/query-keys';

import { CreateActivityData } from '../types/leads-types';

export function useCreateActivity(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => activitiesService.create(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success('فعالیت ثبت شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteActivity(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => activitiesService.delete(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success('فعالیت حذف شد');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAllActivities(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activitiesService.deleteAll(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, leadId] });
      toast.success('همه فعالیت‌ها حذف شدند');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

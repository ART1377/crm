// src/features/leads/hooks/use-avval-history.ts

'use client';

import toast from 'react-hot-toast';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { avvalHistoryService } from '@/features/leads/api/avval-history.api';

const AVVAL_HISTORY_KEY = 'avval-history';

export function useAvvalHistory() {
  return useQuery({
    queryKey: [AVVAL_HISTORY_KEY],
    queryFn: () => avvalHistoryService.getAll().then((r) => r.history),
    staleTime: 30 * 1000,
  });
}

export function useSaveAvvalHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { slug: string; industry: string; count: number; pages: number }) =>
      avvalHistoryService.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AVVAL_HISTORY_KEY] });
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در ثبت تاریخچه'),
  });
}

export function useDeleteAvvalHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => avvalHistoryService.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AVVAL_HISTORY_KEY] });
      toast.success('از تاریخچه حذف شد');
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در حذف'),
  });
}

export function useClearAvvalHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => avvalHistoryService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AVVAL_HISTORY_KEY] });
      toast.success('تاریخچه پاک شد');
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در پاک کردن'),
  });
}

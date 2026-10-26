// src/features/leads/hooks/use-staged-leads.ts

'use client';

import toast from 'react-hot-toast';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { stagedLeadsService } from '@/features/leads/api/staged-leads.api';

import { LEADS_PAGE_SIZE } from '@/constants/constants';
import { LEADS_QUERY_KEY, STAGED_LEADS_QUERY_KEY } from '@/lib/query-keys';

// ✅ دریافت لیست انبار
export function useStagedLeads(params?: {
  status?: string;
  search?: string;
  source?: string; // ✅
  industry?: string; // ✅
}) {
  return useInfiniteQuery({
    queryKey: [STAGED_LEADS_QUERY_KEY, params],
    queryFn: ({ pageParam = 1 }) =>
      stagedLeadsService.getAll({
        ...params,
        page: pageParam,
        limit: LEADS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStagedCounts() {
  return useQuery({
    queryKey: [STAGED_LEADS_QUERY_KEY, 'counts'],
    queryFn: () => stagedLeadsService.getCounts(),
    staleTime: 30 * 1000,
  });
}

// ✅ ذخیره تکی در انبار
export function useSaveToStaging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lead: Parameters<typeof stagedLeadsService.saveOne>[0]) =>
      stagedLeadsService.saveOne(lead),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      if (data.added > 0) {
        toast.success('به انبار ذخیره شد');
      } else {
        toast.error('قبلاً در انبار یا سرنخ‌ها موجود است');
      }
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در ذخیره'),
  });
}

// ✅ ذخیره گروهی در انبار
export function useBulkSaveToStaging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leads: Parameters<typeof stagedLeadsService.saveBulk>[0]) =>
      stagedLeadsService.saveBulk(leads),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      toast.success(`${data.added} سرنخ به انبار ذخیره شد`);
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در ذخیره'),
  });
}

// ✅ وارد کردن تکی از انبار به سرنخ
export function useImportOneFromStaging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stagedLeadsService.importOne(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      if (data.imported > 0) {
        toast.success('سرنخ وارد شد');
      } else {
        toast.error('این سرنخ قبلاً وارد شده است');
      }
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در وارد کردن'),
  });
}

// ✅ وارد کردن گروهی از انبار به سرنخ
export function useBulkImportFromStaging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stagedLeadsService.importBulk(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success(`${data.imported} سرنخ وارد شد (${data.skipped} رد شد)`);
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در وارد کردن'),
  });
}

// ✅ حذف تکی از انبار
export function useDeleteStagedLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stagedLeadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      toast.success('از انبار حذف شد');
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در حذف'),
  });
}

// ✅ حذف گروهی از انبار
export function useBulkDeleteStagedLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => stagedLeadsService.deleteBulk(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAGED_LEADS_QUERY_KEY] });
      toast.success(`${data.deletedCount} سرنخ از انبار حذف شد`);
    },
    onError: (error: Error) => toast.error(error.message || 'خطا در حذف'),
  });
}

// src/hooks/use-leads.ts
"use client";

import toast from "react-hot-toast";

import type { CreateLeadData, LeadFilters, UpdateLeadData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import { leadsService } from "@/services/leads.service";

import { LEADS_PAGE_SIZE } from "@/lib/constants";
import { LEADS_QUERY_KEY } from "@/lib/query-keys";

export function useLeads(filters?: LeadFilters & { sortBy?: string; sortOrder?: string }) {
  return useInfiniteQuery({
    queryKey: [LEADS_QUERY_KEY, "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      leadsService.getAll({
        ...filters,
        page: pageParam,
        limit: LEADS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    placeholderData: (previousData) => previousData,
  });
}

export function useLeadsStats() {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, "stats"],
    queryFn: () => leadsService.getStats(),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id],
    queryFn: () => leadsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadData) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success("سرنخ با موفقیت ایجاد شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadData }) =>
      leadsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [LEADS_QUERY_KEY, variables.id],
      });
      toast.success("سرنخ با موفقیت بروزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success("سرنخ با موفقیت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useChangeLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: string; previousStatus?: string }) =>
      leadsService.changeStatus(data.id, {
        status: data.status,
        previousStatus: data.previousStatus,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, variables.id] });
      toast.success("وضعیت بروزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLeadsAnalytics() {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, "analytics"],
    queryFn: () => leadsService.getAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

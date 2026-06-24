"use client";

import toast from "react-hot-toast";

import apiClient from "@/config/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LIST_OPTIONS_QUERY_KEY } from "@/lib/query-keys";

interface ListOption {
  id: string;
  type: string;
  value: string;
}

export function useListOptions(type: string) {
  return useQuery({
    queryKey: [LIST_OPTIONS_QUERY_KEY, type],
    queryFn: () => apiClient.get(`/list-options?type=${type}`) as Promise<ListOption[]>,
    staleTime: Infinity,
  });
}

export function useSaveListOption(type: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      value,
    }: {
      id?: string;
      value: string;
    }) =>
      id
        ? apiClient.patch(`/list-options/${id}`, { value })
        : apiClient.post("/list-options", { value, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_OPTIONS_QUERY_KEY, type] });
      toast.success("گزینه ذخیره شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteListOption(type: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/list-options/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_OPTIONS_QUERY_KEY, type] });
      toast.success("گزینه حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
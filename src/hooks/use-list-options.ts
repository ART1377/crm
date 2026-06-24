"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listOptionsService } from "@/services/list-options.service";

import { LIST_OPTIONS_QUERY_KEY } from "@/lib/query-keys";

export function useListOptions(type: string) {
  return useQuery({
    queryKey: [LIST_OPTIONS_QUERY_KEY, type],
    queryFn: () => listOptionsService.getAll(type),
    staleTime: Infinity,
  });
}

export function useSaveListOption(type: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id?: string; value: string }) =>
      id ? listOptionsService.update(id, { value }) : listOptionsService.create({ value, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_OPTIONS_QUERY_KEY, type] });
      toast.success("گزینه ذخیره شد");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteListOption(type: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listOptionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_OPTIONS_QUERY_KEY, type] });
      toast.success("گزینه حذف شد");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

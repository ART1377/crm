"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { messengersService } from "@/services/messengers.service";

import { MESSENGER_QUERY_KEY } from "@/lib/query-keys";

export function useMessengers() {
  return useQuery({
    queryKey: [MESSENGER_QUERY_KEY],
    queryFn: () => messengersService.getAll(),
    staleTime: Infinity,
  });
}

export function useSaveMessenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: { name: string; key: string; linkTemplate: string };
    }) => (id ? messengersService.update(id, data) : messengersService.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] });
      toast.success("پیام‌رسان ذخیره شد");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useToggleMessenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      messengersService.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] }),
  });
}

export function useDeleteMessenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messengersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] });
      toast.success("پیام‌رسان حذف شد");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

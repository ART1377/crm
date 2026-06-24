"use client";

import toast from "react-hot-toast";

import apiClient from "@/config/axios";
import type { Messenger } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MESSENGER_QUERY_KEY } from "@/lib/query-keys";

export function useMessengers() {
  return useQuery({
    queryKey: [MESSENGER_QUERY_KEY],
    queryFn: () => apiClient.get("/messengers") as Promise<Messenger[]>,
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
    }) =>
      id
        ? apiClient.patch(`/messengers/${id}`, data)
        : apiClient.post("/messengers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] });
      toast.success("پیام‌رسان ذخیره شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleMessenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/messengers/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] });
    },
  });
}

export function useDeleteMessenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/messengers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSENGER_QUERY_KEY] });
      toast.success("پیام‌رسان حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
// src/hooks/use-settings.ts
"use client";

import toast from "react-hot-toast";

import apiClient from "@/config/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SETTINGS_QUERY_KEY } from "@/lib/query-keys";

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: () => apiClient.get("/settings") as Promise<Record<string, string>>,
    staleTime: Infinity,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, string>) => apiClient.put("/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success("تنظیمات ذخیره شد");
    },
  });
}

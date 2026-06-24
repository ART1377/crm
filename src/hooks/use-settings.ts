// src/hooks/use-settings.ts
"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsService } from "@/services/settings.service";

import { SETTINGS_QUERY_KEY } from "@/lib/query-keys";

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.getAll(),
    staleTime: Infinity,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, string>) => settingsService.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success("تنظیمات ذخیره شد");
    },
  });
}

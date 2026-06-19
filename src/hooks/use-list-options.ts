"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/axios";

interface ListOption {
  id: string;
  type: string;
  value: string;
}

export function useListOptions(type: string) {
  return useQuery({
    queryKey: ["list-options", type],
    queryFn: () =>
      apiClient.get(`/list-options?type=${type}`) as Promise<ListOption[]>,
    staleTime: Infinity,
  });
}
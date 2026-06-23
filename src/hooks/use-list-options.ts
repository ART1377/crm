"use client";

import apiClient from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

interface ListOption {
  id: string;
  type: string;
  value: string;
}

export function useListOptions(type: string) {
  return useQuery({
    queryKey: ["list-options", type],
    queryFn: () => apiClient.get(`/list-options?type=${type}`) as Promise<ListOption[]>,
    staleTime: Infinity,
  });
}

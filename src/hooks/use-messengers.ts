"use client";

import apiClient from "@/config/axios";
import type { Messenger } from "@/types";
import { useQuery } from "@tanstack/react-query";

import { MESSENGER_QUERY_KEY } from "@/lib/query-keys";

export function useMessengers() {
  return useQuery({
    queryKey: [MESSENGER_QUERY_KEY],
    queryFn: () => apiClient.get("/messengers") as Promise<Messenger[]>,
    staleTime: Infinity,
  });
}

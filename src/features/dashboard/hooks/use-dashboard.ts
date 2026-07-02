"use client";

import { useQuery } from "@tanstack/react-query";

import { leadsService } from "@/features/leads/api/leads.api";

import { LEADS_QUERY_KEY } from "@/lib/query-keys";

export function useLeadsStats() {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, "stats"],
    queryFn: () => leadsService.getStats(),
  });
}

export function useLeadsAnalytics() {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, "analytics"],
    queryFn: () => leadsService.getAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

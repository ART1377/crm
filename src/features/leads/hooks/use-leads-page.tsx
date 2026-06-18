// src/features/leads-list/use-leads-page.ts
"use client";

import { useMemo, useState } from "react";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import type { LeadFilters } from "@/types";

const DEFAULT_FILTERS = { status: "", search: "" };

export function useLeadsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryFilters = useMemo<LeadFilters>(
    () => ({
      status: filters.status || undefined,
      search: filters.search || undefined,
    }),
    [filters],
  );

  const { data: leads = [], isLoading } = useLeads(queryFilters);
  const deleteLead = useDeleteLead();

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return {
    leads,
    isLoading,
    filters,
    deleteId,
    hasFilters: Boolean(filters.search || filters.status),
    deleteIsPending: deleteLead.isPending,
    handleFilterChange,
    handleDelete,
    openDeleteDialog: setDeleteId,
    closeDeleteDialog: () => setDeleteId(null),
  };
}
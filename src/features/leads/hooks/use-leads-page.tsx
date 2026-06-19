"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import type { LeadFilters } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { leadsService } from "@/services/leads.service";

const DEFAULT_FILTERS = { status: "", search: "" };

export function useLeadsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSearch = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({
      status: filters.status || undefined,
      search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
      sortBy,
      sortOrder,
    }),
    [filters.status, debouncedSearch, sortBy, sortOrder],
  );

  const exportAllLeads = useCallback(async () => {
    // Fetch all filtered leads without pagination
    const result = await leadsService.getAll({ ...queryFilters, limit: 9999 });
    return result.leads;
  }, [queryFilters]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLeads(queryFilters);

  const deleteLead = useDeleteLead();

  const leads = data?.pages.flatMap((page) => page.leads) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  const handleFilterChange = useCallback(
    (field: keyof typeof filters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    leads,
    totalCount,
    isLoading,
    filters,
    deleteId,
    hasFilters: Boolean(filters.search || filters.status),
    deleteIsPending: deleteLead.isPending,
    isFetchingNextPage,
    loaderRef,
    handleFilterChange,
    handleDelete,
    openDeleteDialog: setDeleteId,
    closeDeleteDialog: () => setDeleteId(null),
    exportAllLeads,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

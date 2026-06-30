"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteLead, useLeads } from "@/hooks/use-leads";

import { leadsService } from "@/services/leads.service";

const DEFAULT_FILTERS = {
  status: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  industry: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function useLeadsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({
      status: filters.status || undefined,
      search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      industry: filters.industry || undefined,
    }),
    [
      filters.status,
      debouncedSearch,
      filters.dateFrom,
      filters.dateTo,
      filters.sortBy,
      filters.sortOrder,
    ]
  );

  const exportAllLeads = useCallback(async () => {
    const result = await leadsService.getAll({ ...queryFilters, limit: 9999 });
    return result.leads;
  }, [queryFilters]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLeads(queryFilters);
  const deleteLead = useDeleteLead();

  const leads = useMemo(() => data?.pages.flatMap((page) => page.leads) ?? [], [data?.pages]);
  const totalCount = data?.pages[0]?.total ?? 0;

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === leads.length ? [] : leads.map((l) => l.id)));
  }, [leads]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds([]), []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleFilterChange = useCallback((field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    observer.observe(loader);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    leads,
    totalCount,
    isLoading,
    filters: {
      status: filters.status,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      industry: filters.industry,
    },
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    deleteId,
    hasFilters: Boolean(
      filters.search || filters.status || filters.dateFrom || filters.dateTo || filters.industry
    ),
    deleteIsPending: deleteLead.isPending,
    isFetchingNextPage,
    loaderRef,
    handleFilterChange,
    setSortBy: (value: string) => setFilters((prev) => ({ ...prev, sortBy: value })),
    setSortOrder: (value: string) => setFilters((prev) => ({ ...prev, sortOrder: value })),
    handleClearFilters,
    handleDelete,
    openDeleteDialog: setDeleteId,
    closeDeleteDialog: () => setDeleteId(null),
    exportAllLeads,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    handleClearSelection,
  };
}

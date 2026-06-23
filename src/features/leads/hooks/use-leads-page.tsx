"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteLead, useLeads } from "@/hooks/use-leads";
import { useQueryParams } from "@/hooks/use-query-params";

import { leadsService } from "@/services/leads.service";

const DEFAULTS = {
  status: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function useLeadsPage() {
  const { params, setParams, resetParams } = useQueryParams(DEFAULTS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(params.search, 300);

  const queryFilters = useMemo(
    () => ({
      status: params.status || undefined,
      search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    [
      params.status,
      debouncedSearch,
      params.dateFrom,
      params.dateTo,
      params.sortBy,
      params.sortOrder,
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

  const handleFilterChange = useCallback(
    (field: string, value: string) => setParams({ [field]: value } as Partial<typeof DEFAULTS>),
    [setParams]
  );

  const setSortBy = useCallback(
    (value: string) => setParams({ sortBy: value } as Partial<typeof DEFAULTS>),
    [setParams]
  );

  const setSortOrder = useCallback(
    (value: string) => setParams({ sortOrder: value } as Partial<typeof DEFAULTS>),
    [setParams]
  );

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
      status: params.status,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    deleteId,
    hasFilters: Boolean(params.search || params.status || params.dateFrom || params.dateTo),
    deleteIsPending: deleteLead.isPending,
    isFetchingNextPage,
    loaderRef,
    handleFilterChange,
    setSortBy,
    setSortOrder,
    handleClearFilters: resetParams,
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

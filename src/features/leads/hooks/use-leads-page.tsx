"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import { useDebounce } from "@/hooks/use-debounce";
import { leadsService } from "@/services/leads.service";

const DEFAULT_FILTERS = { status: "", search: "", dateFrom: "", dateTo: "" };

export function useLeadsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearch = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({
      status: filters.status || undefined,
      search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy,
      sortOrder,
    }),
    [
      filters.status,
      debouncedSearch,
      filters.dateFrom,
      filters.dateTo,
      sortBy,
      sortOrder,
    ],
  );

  const exportAllLeads = useCallback(async () => {
    const result = await leadsService.getAll({ ...queryFilters, limit: 9999 });
    return result.leads;
  }, [queryFilters]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLeads(queryFilters);
  const deleteLead = useDeleteLead();

  const leads = useMemo(
    () => data?.pages.flatMap((page) => page.leads) ?? [],
    [data?.pages],
  );
  const totalCount = data?.pages[0]?.total ?? 0;

  // Moved AFTER leads is defined
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  }, [selectedIds, leads]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds([]), []);

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
    hasFilters: Boolean(
      filters.search || filters.status || filters.dateFrom || filters.dateTo,
    ),
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
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    handleClearSelection,
  };
}

'use client';

import { useCallback, useMemo, useState } from 'react';

import { parseAsString, useQueryStates } from 'nuqs';

import { leadsService } from '@/features/leads/api/leads.api';
import { useDeleteLead, useLeads } from '@/features/leads/hooks/use-leads';

import { useDebounce } from '@/hooks/use-debounce';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

export function useLeadsPage() {
  const [params, setParams] = useQueryStates(
    {
      status: parseAsString.withDefault(''),
      search: parseAsString.withDefault(''),
      dateFrom: parseAsString.withDefault(''),
      dateTo: parseAsString.withDefault(''),
      industry: parseAsString.withDefault(''),
      source: parseAsString.withDefault(''),
      sortBy: parseAsString.withDefault('createdAt'),
      sortOrder: parseAsString.withDefault('desc'),
    },
    { history: 'push', shallow: false }
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearch = useDebounce(params.search, 300);

  const queryFilters = useMemo(
    () => ({
      status: params.status || undefined,
      search: debouncedSearch.length >= 3 ? debouncedSearch : undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      industry: params.industry || undefined,
      source: params.source || undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    [
      params.status,
      debouncedSearch,
      params.dateFrom,
      params.dateTo,
      params.industry,
      params.source,
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

  const loaderRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage,
  });

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
    (field: string, value: string) => setParams({ [field]: value }),
    [setParams]
  );

  const setSortBy = useCallback((value: string) => setParams({ sortBy: value }), [setParams]);

  const setSortOrder = useCallback((value: string) => setParams({ sortOrder: value }), [setParams]);

  const handleClearFilters = useCallback(() => {
    setParams({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      industry: '',
      source: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, [setParams]);

  const hasFilters =
    Boolean(params.search) ||
    Boolean(params.status) ||
    Boolean(params.dateFrom || params.dateTo) ||
    Boolean(params.industry) ||
    Boolean(params.source);

  const filters = {
    status: params.status,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    source: params.source,
    industry: params.industry,
  };

  return {
    leads,
    totalCount,
    isLoading,
    filters,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    deleteId,
    hasFilters,
    deleteIsPending: deleteLead.isPending,
    isFetchingNextPage,
    loaderRef,
    handleFilterChange,
    setSortBy,
    setSortOrder,
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

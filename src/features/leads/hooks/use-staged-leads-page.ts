// src/features/leads/hooks/use-staged-leads-page.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

import { debounce, parseAsString, useQueryStates } from 'nuqs';

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_DELAY } from '@/constants/constants';
import {
  useBulkDeleteStagedLeads,
  useBulkImportFromStaging,
  useDeleteStagedLead,
  useImportOneFromStaging,
  useStagedAllIds,
  useStagedLeads,
} from '@/features/leads/hooks/use-staged-leads';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { useDebounce } from '@/hooks/use-debounce';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useRangeSelection } from '@/hooks/use-range-selection';

import type { StagedLead } from '../components/staged/types';

export function useStagedLeadsPage() {
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString
        .withDefault('')
        .withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_DELAY) }),
      source: parseAsString.withDefault(''),
      industry: parseAsString.withDefault(''),
    },
    { history: 'push', shallow: true }
  );

  // ✅ stateهای دیالوگ حذف
  const [deleteOneId, setDeleteOneId] = useState<string | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(params.search, 300);

  const queryParams = useMemo(
    () => ({
      status: 'PENDING',
      search: debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : undefined,
      source: params.source || undefined,
      industry: params.industry || undefined,
    }),
    [debouncedSearch, params.source, params.industry]
  );

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStagedLeads(queryParams);

  const importOne = useImportOneFromStaging();
  const importBulk = useBulkImportFromStaging();
  const deleteOne = useDeleteStagedLead();
  const deleteBulk = useBulkDeleteStagedLeads();
  const allIds = useStagedAllIds();

  const { data: industryOptions = [] } = useListOptions('INDUSTRY');
  const { data: sourceOptions = [] } = useListOptions('SOURCE');

  const items = useMemo(() => {
    const map = new Map<string, StagedLead>();
    for (const page of data?.pages ?? []) {
      for (const item of page.items) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }, [data?.pages]);

  const totalCount = data?.pages[0]?.total ?? 0;

  const loaderRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage,
  });

  const { selected, setSelected, toggleWithRange, selectAll, clearSelection } =
    useRangeSelection(items);

  const selectAllMatching = useCallback(async () => {
    const result = await allIds.mutateAsync({
      search: debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : undefined,
      source: params.source || undefined,
      industry: params.industry || undefined,
    });
    setSelected(new Set(result.ids));
  }, [allIds, debouncedSearch, params.source, params.industry]);

  // ✅ Import (بدون دیالوگ — چون ایمپورت خطرناک نیست)
  const handleImport = useCallback(() => {
    if (selected.size === 0) return;
    importBulk.mutate(Array.from(selected), {
      onSuccess: () => clearSelection(),
    });
  }, [selected, importBulk, clearSelection]);

  // ✅ حذف تکی: باز کردن دیالوگ
  const openDeleteOneDialog = useCallback((id: string) => {
    setDeleteOneId(id);
  }, []);

  const closeDeleteOneDialog = useCallback(() => {
    setDeleteOneId(null);
  }, []);

  // ✅ تأیید حذف تکی
  const handleDeleteOne = useCallback(async () => {
    if (!deleteOneId) return;
    await deleteOne.mutateAsync(deleteOneId);
    setDeleteOneId(null);
  }, [deleteOneId, deleteOne]);

  // ✅ حذف گروهی: باز کردن دیالوگ
  const openBulkDeleteDialog = useCallback(() => {
    if (selected.size === 0) return;
    setIsBulkDeleteDialogOpen(true);
  }, [selected]);

  const closeBulkDeleteDialog = useCallback(() => {
    setIsBulkDeleteDialogOpen(false);
  }, []);

  // ✅ تأیید حذف گروهی
  const handleDeleteSelected = useCallback(async () => {
    if (selected.size === 0) return;
    await deleteBulk.mutateAsync(Array.from(selected));
    setIsBulkDeleteDialogOpen(false);
    clearSelection();
  }, [selected, deleteBulk, clearSelection]);

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      setParams({ [field]: value });
      clearSelection();
    },
    [setParams, clearSelection]
  );

  const handleClearFilters = useCallback(() => {
    setParams({ search: '', source: '', industry: '' });
    clearSelection();
  }, [setParams, clearSelection]);

  const hasFilters = Boolean(params.search) || Boolean(params.source) || Boolean(params.industry);

  const filters = {
    search: params.search,
    source: params.source,
    industry: params.industry,
  };

  return {
    items,
    totalCount,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    loaderRef,
    filters,
    hasFilters,
    selected,
    toggleWithRange,
    selectAll,
    selectAllMatching,
    isSelectingAll: allIds.isPending,
    clearSelection,
    handleImport,
    // ✅ دیالوگ‌های حذف
    deleteOneId,
    openDeleteOneDialog,
    closeDeleteOneDialog,
    handleDeleteOne,
    isDeleteOnePending: deleteOne.isPending,
    isBulkDeleteDialogOpen,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    handleDeleteSelected,
    isBulkDeleting: deleteBulk.isPending,
    // ... بقیه
    handleFilterChange,
    handleClearFilters,
    importOne,
    deleteOne,
    importBulk,
    deleteBulk,
    industries: industryOptions.map((i) => i.value),
    sources: sourceOptions.map((s) => s.value),
  };
}

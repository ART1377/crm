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
import { StagedLead } from '../components/staged/types';

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

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

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

  // ✅ ادغام همه صفحات با حذف تکراری‌ها
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

  // ✅ toggle با پشتیبانی از Shift+Click
  const toggleWithRange = useCallback(
    (id: string, event?: React.MouseEvent) => {
      if (event?.shiftKey && lastClickedId) {
        const startIdx = items.findIndex((i) => i.id === lastClickedId);
        const endIdx = items.findIndex((i) => i.id === id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const rangeIds = items.slice(from, to + 1).map((i) => i.id);
          setSelected((prev) => new Set([...prev, ...rangeIds]));
          setLastClickedId(id);
          return;
        }
      }
      setSelected((prev) => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
      setLastClickedId(id);
    },
    [items, lastClickedId]
  );

  // ✅ انتخاب همه لود شده‌ها
  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );
  }, [items]);

  // ✅ انتخاب همه نتایج فیلتر (حتی لود نشده‌ها) با API
  const selectAllMatching = useCallback(async () => {
    const result = await allIds.mutateAsync({
      search: debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : undefined,
      source: params.source || undefined,
      industry: params.industry || undefined,
    });
    setSelected(new Set(result.ids));
  }, [allIds, debouncedSearch, params.source, params.industry]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setLastClickedId(null);
  }, []);

  const handleImport = useCallback(() => {
    if (selected.size === 0) return;
    importBulk.mutate(Array.from(selected), {
      onSuccess: () => clearSelection(),
    });
  }, [selected, importBulk, clearSelection]);

  const handleDeleteSelected = useCallback(() => {
    if (selected.size === 0) return;
    deleteBulk.mutate(Array.from(selected), {
      onSuccess: () => clearSelection(),
    });
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
    toggleAll,
    selectAllMatching,
    isSelectingAll: allIds.isPending,
    clearSelection,
    handleImport,
    handleDeleteSelected,
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

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
  useStagedLeads,
} from '@/features/leads/hooks/use-staged-leads';
import { useListOptions } from '@/features/settings/hooks/use-list-options';
import { useDebounce } from '@/hooks/use-debounce';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

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

  // ✅ گرفتن صنایع و منابع از لیست آپشن‌ها
  const { data: industryOptions = [] } = useListOptions('INDUSTRY');
  const { data: sourceOptions = [] } = useListOptions('SOURCE');

  // ✅ ادغام همه صفحات با حذف تکراری‌ها
  const items = useMemo(() => {
    const map = new Map<string, any>();
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

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );
  }, [items]);

  const handleImport = useCallback(() => {
    if (selected.size === 0) return;
    importBulk.mutate(Array.from(selected), {
      onSuccess: () => setSelected(new Set()),
    });
  }, [selected, importBulk]);

  const handleDeleteSelected = useCallback(() => {
    if (selected.size === 0) return;
    deleteBulk.mutate(Array.from(selected), {
      onSuccess: () => setSelected(new Set()),
    });
  }, [selected, deleteBulk]);

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      setParams({ [field]: value });
      setSelected(new Set());
    },
    [setParams]
  );

  const handleClearFilters = useCallback(() => {
    setParams({ search: '', source: '', industry: '' });
    setSelected(new Set());
  }, [setParams]);

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
    toggle,
    toggleAll,
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

// src/features/tasks/hooks/use-tasks-page.ts

'use client';

import { useCallback, useMemo, useState } from 'react';

import { debounce, parseAsString, useQueryStates } from 'nuqs';

import { useAllTasks, useBulkDeleteTasks, useDeleteTask } from '@/features/tasks/hooks/use-tasks';

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_DELAY } from '@/constants/constants';
import { useDebounce } from '@/hooks/use-debounce';

export function useTasksPage() {
  const [params, setParams] = useQueryStates(
    {
      status: parseAsString.withDefault('all'),
      dueDate: parseAsString.withDefault('all'),
      search: parseAsString
        .withDefault('')
        .withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_DELAY) }),
      sortBy: parseAsString.withDefault('dueDate'),
      sortOrder: parseAsString.withDefault('asc'),
      overdueDays: parseAsString.withDefault(''),
    },
    { history: 'push', shallow: true }
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(params.search, 300);

  const deleteTask = useDeleteTask();
  const bulkDeleteTasks = useBulkDeleteTasks();

  const queryFilters = useMemo(
    () => ({
      status: params.status,
      dueDate: params.dueDate,
      search: debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      overdueDays: params.overdueDays,
    }),
    [
      params.status,
      params.dueDate,
      debouncedSearch,
      params.sortBy,
      params.sortOrder,
      params.overdueDays,
    ]
  );

  const { data: tasks = [], isLoading, isFetching, refetch } = useAllTasks(queryFilters);

  const counts = useMemo(() => {
    const all = tasks.length;
    const pending = tasks.filter((t) => !t.isCompleted).length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const overdue = tasks.filter((t) => !t.isCompleted && new Date(t.dueDate) < new Date()).length;
    const today = tasks.filter((t) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    }).length;
    const week = tasks.filter((t) => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      const due = new Date(t.dueDate);
      return due >= start && due <= end;
    }).length;
    const month = tasks.filter((t) => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      const due = new Date(t.dueDate);
      return due >= start && due <= end;
    }).length;
    return { all, pending, completed, overdue, today, week, month };
  }, [tasks]);

  const handleFilterChange = useCallback(
    (field: string, value: string) => setParams({ [field]: value }),
    [setParams]
  );

  const handleSortByChange = useCallback(
    (value: string) => setParams({ sortBy: value }),
    [setParams]
  );

  const handleSortOrderChange = useCallback(
    (value: string) => setParams({ sortOrder: value }),
    [setParams]
  );

  const handleClearFilters = useCallback(() => {
    setParams({
      status: 'all',
      dueDate: 'all',
      search: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  }, [setParams]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTask.mutateAsync(deleteId);
    setDeleteId(null);
    refetch();
  };

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === tasks.length ? [] : tasks.map((t) => t.id)));
  }, [tasks]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds([]), []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await bulkDeleteTasks.mutateAsync(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteDialogOpen(false);
    refetch();
  }, [selectedIds, bulkDeleteTasks, refetch]);

  const hasFilters = params.status !== 'all' || params.dueDate !== 'all' || Boolean(params.search);

  return {
    tasks,
    isLoading,
    isFetching,
    filters: {
      status: params.status,
      dueDate: params.dueDate,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    counts,
    hasFilters,
    deleteId,
    deleteIsPending: deleteTask.isPending,
    selectedIds,
    isBulkDeleteDialogOpen,
    isBulkDeleting: bulkDeleteTasks.isPending,
    handleFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handleClearFilters,
    handleDelete,
    openDeleteDialog: setDeleteId,
    closeDeleteDialog: () => setDeleteId(null),
    handleSelectAll,
    handleSelectOne,
    handleClearSelection,
    openBulkDeleteDialog: () => setIsBulkDeleteDialogOpen(true),
    closeBulkDeleteDialog: () => setIsBulkDeleteDialogOpen(false),
    handleBulkDelete,
  };
}

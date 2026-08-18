// src/features/tasks/index.tsx

'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { DeleteConfirmDialog } from '@/components/shared/delete-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import { BulkActionsBar } from './components/bulk-actions-bar';
import { TasksEmptyState } from './components/empty';
import { ExportDialog } from './components/export-dialog';
import { TaskFilters } from './components/filters';
import { TasksSkeleton } from './components/skeleton';
import { TasksTable } from './components/table';
import { useTasksPage } from './hooks/use-tasks-page';

export function TasksPage() {
  const {
    tasks,
    isLoading,
    isFetching,
    filters,
    counts,
    hasFilters,
    deleteId,
    deleteIsPending,
    selectedIds,
    handleFilterChange,
    handleClearFilters,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
    handleSelectAll,
    handleSelectOne,
    handleClearSelection,
    isBulkDeleteDialogOpen,
    isBulkDeleting,
    handleBulkDelete,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    handleSortByChange,
    handleSortOrderChange,
    exportAllTasks,
    exportSelectedTasks,
  } = useTasksPage();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExportingSelected, setIsExportingSelected] = useState(false);

  const handleExportSelected = () => {
    if (selectedIds.length === 0) return;
    setIsExportingSelected(true);
    setExportDialogOpen(true);
  };

  const handleExportAll = async () => {
    return exportAllTasks();
  };

  const handleExportSelectedTasks = async () => {
    return exportSelectedTasks();
  };

  return (
    <PageWrapper
      header={<PageHeader title="مدیریت تسک‌ها" description="همه پیگیری‌ها و وظایف در یک نگاه" />}
    >
      <TaskFilters
        filters={filters}
        counts={counts}
        onFilterChange={handleFilterChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={handleClearFilters}
      />

      <Card className="min-h-100 flex-1 overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{counts.all} تسک پیدا شد</CardTitle>
          <div className="flex items-center gap-2">
            <ExportDialog totalCount={counts.all} onExportAll={handleExportAll} />
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading ? (
              <TasksSkeleton />
            ) : (
              <>
                {isFetching && (
                  <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  </div>
                )}

                {tasks.length === 0 ? (
                  <TasksEmptyState hasFilters={hasFilters} />
                ) : (
                  <>
                    {selectedIds.length > 0 && (
                      <BulkActionsBar
                        selectedIds={selectedIds}
                        selectedCount={selectedIds.length}
                        selectedTasks={tasks.filter((task) => selectedIds.includes(task.id))}
                        onBulkDelete={openBulkDeleteDialog}
                        onClearSelection={handleClearSelection}
                        isDeleting={isBulkDeleting}
                        onExportSelected={handleExportSelected}
                      />
                    )}
                    <TasksTable
                      tasks={tasks}
                      onDelete={openDeleteDialog}
                      selectedIds={selectedIds}
                      onSelectAll={handleSelectAll}
                      onSelectOne={handleSelectOne}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* دیالوگ حذف تکی */}
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="حذف تسک"
        description="آیا از حذف این تسک اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        isPending={deleteIsPending}
      />

      {/* دیالوگ حذف گروهی */}
      <DeleteConfirmDialog
        open={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title="حذف گروهی تسک‌ها"
        description={`آیا از حذف ${selectedIds.length} تسک انتخاب شده اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        isPending={isBulkDeleting}
      />

      {/* دیالوگ خروجی انتخابی */}
      {isExportingSelected && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          totalCount={selectedIds.length}
          onExportAll={handleExportSelectedTasks}
        />
      )}
    </PageWrapper>
  );
}

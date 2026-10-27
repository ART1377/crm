// src/features/leads/components/staged/index.tsx

'use client';

import { Archive, CheckSquare, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { DeleteConfirmDialog } from '@/components/shared/delete-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import { useStagedLeadsPage } from '@/features/leads/hooks/use-staged-leads-page';

import { StagedFilters } from './components/staged-filters';
import { StagedLeadCard } from './components/staged-lead-card';
import type { StagedLead } from './types';

export function StagedLeadsPage() {
  const {
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
    isSelectingAll,
    clearSelection,
    handleImport,
    // ✅
    deleteOneId,
    openDeleteOneDialog,
    closeDeleteOneDialog,
    handleDeleteOne,
    isDeleteOnePending,
    isBulkDeleteDialogOpen,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    handleDeleteSelected,
    isBulkDeleting,
    // ...
    handleFilterChange,
    handleClearFilters,
    importOne,
    importBulk,
  } = useStagedLeadsPage();

  return (
    <PageWrapper
      header={
        <PageHeader
          title="انبار سرنخ‌ها"
          description="سرنخ‌هایی که ذخیره کردی و هنوز وارد نکردی"
          actions={
            <div className="flex gap-2">
              {selected.size > 0 && (
                <>
                  <Button variant="outline" onClick={clearSelection} className="gap-2">
                    <X className="h-4 w-4" />
                    پاک کردن ({selected.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openBulkDeleteDialog} // ✅ باز کردن دیالوگ
                    disabled={isBulkDeleting}
                    className="gap-2 text-red-600"
                  >
                    {isBulkDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال حذف...
                      </>
                    ) : (
                      `حذف (${selected.size})`
                    )}
                  </Button>
                  <Button onClick={handleImport} disabled={importBulk.isPending} className="gap-2">
                    {importBulk.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال وارد کردن...
                      </>
                    ) : (
                      `وارد کردن (${selected.size})`
                    )}
                  </Button>
                </>
              )}
            </div>
          }
        />
      }
    >
      <StagedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Card className="flex min-h-100 flex-1 flex-col">
        <CardHeader className="flex shrink-0 flex-row items-center justify-between">
          <CardTitle>
            {isLoading ? (
              <span className="text-muted-foreground inline-flex items-center gap-2 text-sm font-normal">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال بارگذاری...
              </span>
            ) : (
              <>
                {totalCount} سرنخ در انبار
                {items.length < totalCount && (
                  <span className="text-muted-foreground mr-2 text-xs font-normal">
                    ({items.length} نمایش داده شده)
                  </span>
                )}
              </>
            )}
          </CardTitle>
          {items.length > 0 && !isLoading && (
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={selected.size === items.length && items.length > 0}
                  onCheckedChange={selectAll}
                />
                انتخاب همه ({selected.size}/{items.length})
              </label>

              {totalCount > items.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllMatching}
                  disabled={isSelectingAll}
                  className="gap-1.5 text-xs"
                >
                  {isSelectingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckSquare className="h-3 w-3" />
                  )}
                  انتخاب همه ({totalCount})
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center py-12 text-center">
              <Archive className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">
                {hasFilters ? 'نتیجه‌ای با این فیلترها پیدا نشد' : 'انبار خالی است'}
              </p>
              <p className="mt-1 text-xs">
                {hasFilters
                  ? 'فیلترها را تغییر دهید یا بازنشانی کنید'
                  : 'از صفحات جستجو، نتایج مورد نظر را در انبار ذخیره کن'}
              </p>
            </div>
          ) : (
            <div className="h-full space-y-2 overflow-y-auto pr-1">
              {isFetching && !isFetchingNextPage && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  در حال به‌روزرسانی...
                </div>
              )}

              {items.map((item: StagedLead) => (
                <StagedLeadCard
                  key={item.id}
                  lead={item}
                  checked={selected.has(item.id)}
                  importing={importOne.isPending && importOne.variables === item.id}
                  deleting={isDeleteOnePending && deleteOneId === item.id}
                  onToggle={(e) => toggleWithRange(item.id, e)}
                  onImport={() => importOne.mutate(item.id)}
                  onDelete={() => openDeleteOneDialog(item.id)} // ✅ باز کردن دیالوگ
                />
              ))}

              <div ref={loaderRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                )}
                {!hasNextPage && items.length > 0 && (
                  <span className="text-muted-foreground text-xs">همه سرنخ‌ها نمایش داده شد</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ دیالوگ حذف تکی */}
      <DeleteConfirmDialog
        open={Boolean(deleteOneId)}
        onClose={closeDeleteOneDialog}
        onConfirm={handleDeleteOne}
        title="حذف از انبار"
        description="آیا از حذف این سرنخ از انبار اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        isPending={isDeleteOnePending}
      />

      {/* ✅ دیالوگ حذف گروهی */}
      <DeleteConfirmDialog
        open={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={handleDeleteSelected}
        title="حذف گروهی از انبار"
        description={`آیا از حذف ${selected.size} سرنخ انتخاب شده از انبار اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
        isPending={isBulkDeleting}
      />
    </PageWrapper>
  );
}

// src/features/leads/components/staged/index.tsx

'use client';

import { Archive, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

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
    hasNextPage,
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
                  <Button
                    variant="outline"
                    onClick={handleDeleteSelected}
                    disabled={deleteBulk.isPending}
                    className="gap-2 text-red-600"
                  >
                    {deleteBulk.isPending ? (
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
      {/* ✅ فیلترها همیشه دیده می‌شن */}
      <StagedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Card className="min-h-100 flex-1 overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
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
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <Checkbox
                checked={selected.size === items.length && items.length > 0}
                onCheckedChange={toggleAll}
              />
              انتخاب همه ({selected.size}/{items.length})
            </label>
          )}
        </CardHeader>
        <CardContent>
          {/* ✅ فقط محتوای داخل کارت لودینگ می‌شه */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
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
            <div className="max-h-[calc(100vh-24rem)] space-y-2 overflow-y-auto pr-1">
              {/* ✅ overlay نازک برای isFetching (refetch با فیلتر جدید) */}
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
                  deleting={deleteOne.isPending && deleteOne.variables === item.id}
                  onToggle={() => toggle(item.id)}
                  onImport={() => importOne.mutate(item.id)}
                  onDelete={() => deleteOne.mutate(item.id)}
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
    </PageWrapper>
  );
}

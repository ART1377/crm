// src/features/leads/components/staged/index.tsx

'use client';

import { Archive, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { PageHeader } from '@/components/shared/page-header';
import { PageWrapper } from '@/components/shared/page-wrapper';

import {
  useBulkDeleteStagedLeads,
  useBulkImportFromStaging,
  useDeleteStagedLead,
  useImportOneFromStaging,
  useStagedLeads,
} from '@/features/leads/hooks/use-staged-leads';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

import { StagedLeadCard } from './components/staged-lead-card';
import type { StagedLead } from './types';

export function StagedLeadsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useStagedLeads({
    status: 'PENDING',
  });

  const importOne = useImportOneFromStaging();
  const importBulk = useBulkImportFromStaging();
  const deleteOne = useDeleteStagedLead();
  const deleteBulk = useBulkDeleteStagedLeads();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ✅ ادغام همه صفحات
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

  // ✅ اینفینیت اسکرول
  const loaderRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage,
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    // ✅ انتخاب همه فقط آیتم‌های لود شده (چون بقیه هنوز لود نشدن)
    setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  };

  const handleImport = () => {
    if (selected.size === 0) return;
    importBulk.mutate(Array.from(selected), {
      onSuccess: () => setSelected(new Set()),
    });
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    deleteBulk.mutate(Array.from(selected), {
      onSuccess: () => setSelected(new Set()),
    });
  };

  if (isLoading) {
    return (
      <PageWrapper header={<PageHeader title="انبار سرنخ‌ها" />}>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

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
                    {deleteBulk.isPending ? 'در حال حذف...' : `حذف (${selected.size})`}
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
      <Card className="min-h-100 flex-1 overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          {/* ✅ نمایش تعداد کل */}
          <CardTitle>
            {totalCount} سرنخ در انبار
            {items.length < totalCount && (
              <span className="text-muted-foreground mr-2 text-xs font-normal">
                ({items.length} نمایش داده شده)
              </span>
            )}
          </CardTitle>
          {items.length > 0 && (
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
          {items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <Archive className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">انبار خالی است</p>
              <p className="mt-1 text-xs">از صفحات جستجو، نتایج مورد نظر را در انبار ذخیره کن</p>
            </div>
          ) : (
            <>
              <div className="max-h-[calc(100vh-20rem)] space-y-2 overflow-y-auto pr-1">
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

                {/* ✅ Loader برای اینفینیت اسکرول */}
                <div ref={loaderRef} className="flex justify-center py-4">
                  {isFetchingNextPage && (
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  )}
                  {!hasNextPage && items.length > 0 && (
                    <span className="text-muted-foreground text-xs">همه سرنخ‌ها نمایش داده شد</span>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

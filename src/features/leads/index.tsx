"use client";

import { useCallback } from "react";

import Link from "next/link";

import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHeader } from "@/components/shared/page-header";
import { PageWrapper } from "@/components/shared/page-wrapper";

import { useUpdateLead } from "@/hooks/use-leads";

import { BulkActionsBar } from "./bulk-actions-bar";
import { DeleteLeadDialog } from "./delete-dialog";
import { LeadsEmptyState } from "./empty";
import { ExportDialog } from "./export-dialog";
import { LeadsFilters } from "./filters";
import { useLeadsPage } from "./hooks/use-leads-page";
import { LeadsPageSkeleton } from "./skeleton";
import { LeadsTable } from "./table";

export function LeadsPage() {
  const {
    leads,
    totalCount,
    isLoading,
    filters,
    sortBy,
    sortOrder,
    deleteId,
    hasFilters,
    deleteIsPending,
    isFetchingNextPage,
    loaderRef,
    handleFilterChange,
    setSortBy,
    setSortOrder,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
    exportAllLeads,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    handleClearSelection,
    handleClearFilters,
  } = useLeadsPage();

  const updateLead = useUpdateLead();

  const handleStatusChange = (id: string, status: string) => {
    updateLead.mutate({ id, data: { status } });
  };

  const handleBulkStatusChange = useCallback(
    (status: string) => {
      if (!status) return;
      selectedIds.forEach((id) => updateLead.mutate({ id, data: { status } }));
      handleClearSelection();
    },
    [selectedIds, updateLead, handleClearSelection]
  );

  if (isLoading) return <LeadsPageSkeleton />;

  return (
    <PageWrapper
      header={
        <PageHeader
          title="سرنخ‌ها"
          description="مدیریت و پیگیری سرنخ‌های فروش"
          actions={
            <Link href="/leads/new">
              <Button size="lg">
                <Plus className="ml-2 h-5 w-5" />
                افزودن سرنخ جدید
              </Button>
            </Link>
          }
        />
      }
    >
      <LeadsFilters
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={handleFilterChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
      />

      <Card className="flex-1 overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{totalCount} سرنخ پیدا شد</CardTitle>
          <ExportDialog totalCount={totalCount} onExportAll={exportAllLeads} />
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <LeadsEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              {selectedIds.length > 0 && (
                <BulkActionsBar
                  selectedCount={selectedIds.length}
                  onBulkStatusChange={handleBulkStatusChange}
                  onClearSelection={handleClearSelection}
                />
              )}
              <LeadsTable
                leads={leads}
                onDelete={openDeleteDialog}
                onStatusChange={handleStatusChange}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
              />
              <div ref={loaderRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DeleteLeadDialog
        open={Boolean(deleteId)}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        isPending={deleteIsPending}
      />
    </PageWrapper>
  );
}

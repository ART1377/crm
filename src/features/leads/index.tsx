"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useLeadsPage } from "./hooks/use-leads-page";
import { LeadsPageSkeleton } from "./skeleton";
import { LeadsFilters } from "./filters";
import { DeleteLeadDialog } from "./delete-dialog";
import { LeadsTable } from "./table";
import { LeadsEmptyState } from "./empty";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUpdateLead } from "@/hooks/use-leads";
import { Lead } from "@/types";

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
  } = useLeadsPage();

  const handleExportAll = async (): Promise<Lead[]> => {
    return await exportAllLeads();
  };

  const updateLead = useUpdateLead();

  const handleStatusChange = (id: string, status: string) => {
    updateLead.mutate({ id, data: { status } });
  };

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
      />
      ;
      <Card className="flex-1 overflow-y-auto">
        <CardHeader>
          <CardTitle>{totalCount} سرنخ پیدا شد</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <LeadsEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <LeadsTable
                leads={leads}
                totalCount={totalCount}
                onDelete={openDeleteDialog}
                onExportAll={handleExportAll}
                onStatusChange={handleStatusChange}
              />
              <div ref={loaderRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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

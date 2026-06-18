// src/features/leads/index.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LeadsHeader,
  LeadsFilters,
  LeadsEmptyState,
  LeadsTable,
  DeleteLeadDialog,
  LeadsPageSkeleton,
} from "@/components/leads";
import { useLeadsPage } from "./hooks/use-leads-page";

export function LeadsPage() {
  const {
    leads,
    isLoading,
    filters,
    deleteId,
    hasFilters,
    deleteIsPending,
    handleFilterChange,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
  } = useLeadsPage();

  if (isLoading) return <LeadsPageSkeleton />;

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsFilters filters={filters} onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader>
          <CardTitle>{leads.length} سرنخ پیدا شد</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <LeadsEmptyState hasFilters={hasFilters} />
          ) : (
            <LeadsTable leads={leads} onDelete={openDeleteDialog} />
          )}
        </CardContent>
      </Card>

      <DeleteLeadDialog
        open={Boolean(deleteId)}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        isPending={deleteIsPending}
      />
    </div>
  );
}
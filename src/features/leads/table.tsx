"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Trash2, Download } from "lucide-react";
import type { Lead } from "@/types";
import { formatDate } from "@/lib/utils";
import { getSourceLabel } from "@/features/leads/lead-helpers";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";

interface LeadsTableProps {
  leads: Lead[];
  totalCount: number;
  onDelete: (id: string) => void;
  onExportAll: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export function exportToCsv(leads: Lead[]) {
  const headers = [
    "نام کسب‌وکار",
    "شخص تماس",
    "شماره اصلی",
    "شماره دوم",
    "صنعت",
    "منبع",
    "وضعیت",
    "تاریخ ثبت",
  ];

  const rows = leads.map((lead) => [
    lead.businessName,
    lead.contactPerson || "",
    `=""${lead.phoneNumber}""`,
    lead.secondaryPhone ? `=""${lead.secondaryPhone}""` : "",
    lead.industry,
    LEAD_SOURCES.find((s) => s.value === lead.source)?.label || lead.source,
    LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status,
    formatDate(new Date(lead.createdAt)),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => String(cell)).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-${formatDate(new Date()).replace(/\//g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function LeadsTable({
  leads,
  totalCount,
  onDelete,
  onExportAll,
  onStatusChange,
}: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportAll}
          disabled={totalCount === 0}
        >
          <Download className="ml-2 h-4 w-4" />
          خروجی CSV ({totalCount} مورد)
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">نام کسب‌وکار</TableHead>
            <TableHead className="text-start">شخص تماس</TableHead>
            <TableHead className="text-start">شماره اصلی</TableHead>
            <TableHead className="text-start">شماره دوم</TableHead>
            <TableHead className="text-start">صنعت</TableHead>
            <TableHead className="text-start">منبع</TableHead>
            <TableHead className="text-start">وضعیت</TableHead>
            <TableHead className="text-start">تاریخ ثبت</TableHead>
            <TableHead className="text-start">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/leads/${lead.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {lead.businessName}
                </Link>
              </TableCell>
              <TableCell>{lead.contactPerson || "---"}</TableCell>
              <TableCell>
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="hover:underline text-primary block"
                >
                  {lead.phoneNumber}
                </a>
              </TableCell>
              <TableCell>
                {lead.secondaryPhone ? (
                  <a
                    href={`tel:${lead.secondaryPhone}`}
                    className="hover:underline text-primary block"
                  >
                    {lead.secondaryPhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </TableCell>
              <TableCell>{lead.industry}</TableCell>
              <TableCell>{getSourceLabel(lead.source)}</TableCell>
              <TableCell>
                <Select
                  value={lead.status}
                  onValueChange={(value) => onStatusChange(lead.id, value)}
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{formatDate(new Date(lead.createdAt))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/leads/${lead.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(lead.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

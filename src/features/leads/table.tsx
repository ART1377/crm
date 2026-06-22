"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, Trash2, Download, Pencil } from "lucide-react";
import type { Lead } from "@/types";
import { formatDate } from "@/lib/utils";
import { getSourceLabel } from "@/features/leads/lead-helpers";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";
import { EditLeadDialog } from "./detail/edit-lead-dialog";

interface LeadsTableProps {
  leads: Lead[];
  totalCount: number;
  onDelete: (id: string) => void;
  onExportAll: () => Promise<Lead[]>;
  onStatusChange: (id: string, status: string) => void;
  selectedIds: string[];
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onBulkStatusChange: (status: string) => void;
  onClearSelection: () => void;
}

const ALL_COLUMNS = [
  { key: "businessName", label: "نام کسب‌وکار" },
  { key: "contactPerson", label: "شخص تماس" },
  { key: "phoneNumber", label: "شماره اصلی" },
  { key: "secondaryPhone", label: "شماره دوم" },
  { key: "industry", label: "صنعت" },
  { key: "source", label: "منبع" },
  { key: "status", label: "وضعیت" },
  { key: "createdAt", label: "تاریخ ثبت" },
] as const;

type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

const DEFAULT_COLUMNS: ColumnKey[] = [
  "businessName",
  "phoneNumber",
  "industry",
  "source",
  "status",
];

function normalizePhoneNumber(value: string): string {
  if (!value) return "";
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 1728),
    ) // Persian to English
    .replace(/[^\d]/g, ""); // Remove non-digits
}

function getCellValue(lead: Lead, key: ColumnKey): string {
  switch (key) {
    case "businessName":
      return lead.businessName;
    case "contactPerson":
      return lead.contactPerson || "";
    case "phoneNumber":
      return normalizePhoneNumber(lead.phoneNumber);
    case "secondaryPhone":
      return normalizePhoneNumber(lead.secondaryPhone || "");
    case "industry":
      return lead.industry;
    case "source":
      return (
        LEAD_SOURCES.find((s) => s.value === lead.source)?.label ||
        lead.source ||
        ""
      );
    case "status":
      return (
        LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status
      );
    case "createdAt":
      return formatDate(new Date(lead.createdAt));
    default:
      return "";
  }
}

function exportToText(leads: Lead[], columns: ColumnKey[]) {
  const lines = leads.map((lead) => {
    const items = columns
      .map((key) => {
        const value = getCellValue(lead, key);
        if (!value) return null;
        const label = ALL_COLUMNS.find((c) => c.key === key)!.label;
        return `  ${label}: ${value}`;
      })
      .filter(Boolean);

    return [`📋 ${lead.businessName}`, ...items, ""].join("\n");
  });

  const content = `گزارش سرنخ‌ها - ${formatDate(new Date())}\n${"=".repeat(40)}\n\n${lines.join("\n")}`;

  const blob = new Blob(["\uFEFF" + content], {
    type: "text/plain;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${formatDate(new Date()).replace(/\//g, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCsv(leads: Lead[], columns: ColumnKey[]) {
  const headers = columns.map(
    (key) => ALL_COLUMNS.find((c) => c.key === key)!.label,
  );
  const rows = leads.map((lead) =>
    columns.map((key) => {
      const value = getCellValue(lead, key);
      if (key === "phoneNumber" || key === "secondaryPhone") {
        return value ? `=""${value}""` : "";
      }
      return value;
    }),
  );
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => String(cell)).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${formatDate(new Date()).replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LeadsTable({
  leads,
  totalCount,
  onDelete,
  onExportAll,
  onStatusChange,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onBulkStatusChange,
  onClearSelection,
}: LeadsTableProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < leads.length;
  const [exportFormat, setExportFormat] = useState<"csv" | "txt">("csv");
  const [selectedColumns, setSelectedColumns] =
    useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const toggleColumn = (key: ColumnKey) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      const input = checkboxRef.current.querySelector("input");
      if (input) {
        input.indeterminate = someSelected;
      }
    }
  }, [someSelected]);

  const handleExport = async () => {
    if (selectedColumns.length === 0) return;
    const allLeads = await onExportAll();
    if (exportFormat === "txt") {
      exportToText(allLeads, selectedColumns);
    } else {
      exportToCsv(allLeads, selectedColumns);
    }
    setIsExportOpen(false);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-3">
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={totalCount === 0}>
              <Download className="ml-2 h-4 w-4" />
              خروجی ({totalCount})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تنظیمات خروجی</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>فرمت خروجی</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as "csv" | "txt")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (اکسل)</SelectItem>
                    <SelectItem value="txt">TXT (متن ساده)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ستون‌های انتخابی</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_COLUMNS.map((col) => (
                    <div key={col.key} className="flex items-center gap-2">
                      <Checkbox
                        id={col.key}
                        checked={selectedColumns.includes(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label
                        htmlFor={col.key}
                        className="text-sm cursor-pointer"
                      >
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleExport}
                disabled={selectedColumns.length === 0}
              >
                <Download className="ml-2 h-4 w-4" />
                دانلود ({totalCount} سرنخ)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">
            {selectedIds.length} سرنخ انتخاب شد
          </span>
          <Select value="" onValueChange={onBulkStatusChange}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="تغییر وضعیت گروهی" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="mr-auto"
          >
            لغو انتخاب
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                ref={checkboxRef}
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
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
            <TableRow
              key={lead.id}
              className={selectedIds.includes(lead.id) ? "bg-primary/5" : ""}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(lead.id)}
                  onCheckedChange={() => onSelectOne(lead.id)}
                />
              </TableCell>
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
                  <EditLeadDialog lead={lead}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </EditLeadDialog>
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Download } from "lucide-react";
import {
  ALL_COLUMNS,
  DEFAULT_COLUMNS,
  exportToCsv,
  exportToText,
  type ColumnKey,
} from "./export-utils";
import type { Lead } from "@/types";

interface ExportDialogProps {
  totalCount: number;
  onExportAll: () => Promise<Lead[]>;
}

export function ExportDialog({ totalCount, onExportAll }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "txt">("csv");
  const [columns, setColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    if (columns.length === 0) return;
    const allLeads = await onExportAll();
    if (format === "txt") {
      exportToText(allLeads, columns);
    } else {
      exportToCsv(allLeads, columns);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              value={format}
              onValueChange={(v) => setFormat(v as "csv" | "txt")}
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
                    checked={columns.includes(col.key)}
                    onCheckedChange={() =>
                      setColumns((prev) =>
                        prev.includes(col.key)
                          ? prev.filter((k) => k !== col.key)
                          : [...prev, col.key],
                      )
                    }
                  />
                  <Label htmlFor={col.key} className="text-sm cursor-pointer">
                    {col.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={columns.length === 0}
          >
            <Download className="ml-2 h-4 w-4" />
            دانلود ({totalCount} سرنخ)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

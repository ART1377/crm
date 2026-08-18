// src/features/tasks/components/export-dialog.tsx

'use client';

import { useState } from 'react';

import { Download, FileSpreadsheet, FileText, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Task } from '../types/tasks-types';
import { ALL_COLUMNS, type ColumnKey, exportToCsv, exportToText } from '../utils/export-utils';

interface ExportDialogProps {
  totalCount: number;
  onExportAll: () => Promise<Task[]>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExportDialog({
  totalCount,
  onExportAll,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ExportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'txt'>('txt');
  const [columns, setColumns] = useState<ColumnKey[]>(['title', 'leadName', 'dueDate', 'status']);
  const [splitCount, setSplitCount] = useState('1');
  const [generatedParts, setGeneratedParts] = useState<{ name: string; tasks: Task[] }[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
    if (!open) setGeneratedParts(null);
  };

  const splitNumber = parseInt(splitCount) || 1;
  const tasksPerFile = Math.ceil(totalCount / splitNumber);
  const allColumnsSelected = columns.length === ALL_COLUMNS.length;

  const toggleAllColumns = () => {
    setColumns(allColumnsSelected ? [] : [...ALL_COLUMNS.map((c) => c.key)]);
  };

  const handleGenerate = async () => {
    if (columns.length === 0) return;
    setLoading(true);
    try {
      const allTasks = await onExportAll();
      const dateStr = new Date().toLocaleDateString('fa-IR').replace(/[\/]/g, '-');

      const parts: { name: string; tasks: Task[] }[] = [];

      if (splitNumber <= 1 || allTasks.length <= tasksPerFile) {
        parts.push({ name: `${dateStr}-قسمت-1`, tasks: allTasks });
      } else {
        for (let i = 0; i < splitNumber; i++) {
          const chunk = allTasks.slice(i * tasksPerFile, (i + 1) * tasksPerFile);
          if (!chunk.length) break;
          parts.push({ name: `${dateStr}-قسمت-${i + 1}`, tasks: chunk });
        }
      }

      setGeneratedParts(parts);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPart = (part: { name: string; tasks: Task[] }) => {
    if (format === 'txt') {
      exportToText(part.tasks, columns, part.name);
    } else {
      exportToCsv(part.tasks, columns, part.name);
    }
  };

  const handleReset = () => setGeneratedParts(null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" disabled={totalCount === 0} className="gap-2">
            <Download className="h-4 w-4" />
            خروجی ({totalCount})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] max-w-md! flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-bold">تنظیمات خروجی</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-1">
          {/* Format toggle */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">فرمت خروجی</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('txt')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                  format === 'txt'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted text-muted-foreground hover:border-primary/30'
                }`}
              >
                <FileText className="h-4 w-4" />
                TXT
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                  format === 'csv'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted text-muted-foreground hover:border-primary/30'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>

          {/* Split count */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">تعداد فایل‌ها</Label>
            <Input
              type="number"
              min="1"
              max={totalCount}
              value={splitCount}
              onChange={(e) => setSplitCount(e.target.value || '1')}
              className="h-11 rounded-xl border-2 text-center text-sm"
            />
            {splitNumber > 1 && (
              <p className="text-muted-foreground text-center text-[11px]">
                ≈ {tasksPerFile} تسک در هر فایل
              </p>
            )}
          </div>

          {/* Columns */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground text-xs font-medium">ستون‌ها</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllColumns}
                className="text-muted-foreground hover:text-foreground h-7 gap-1 rounded-lg text-[11px]"
              >
                {allColumnsSelected ? 'حذف همه' : 'انتخاب همه'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 transition-all ${
                    columns.includes(col.key)
                      ? 'border-primary/30 bg-primary/5'
                      : 'bg-muted/30 hover:bg-muted/50 border-transparent'
                  }`}
                >
                  <Checkbox
                    checked={columns.includes(col.key)}
                    onCheckedChange={() =>
                      setColumns((prev) =>
                        prev.includes(col.key)
                          ? prev.filter((k) => k !== col.key)
                          : [...prev, col.key]
                      )
                    }
                  />
                  <span className="text-xs">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action */}
          {generatedParts ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs font-medium">آماده دانلود</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground h-7 gap-1 rounded-lg text-[11px]"
                >
                  <RotateCcw className="h-3 w-3" />
                  تنظیم مجدد
                </Button>
              </div>
              <div className="space-y-2">
                {generatedParts.map((part) => (
                  <Button
                    key={part.name}
                    onClick={() => handleDownloadPart(part)}
                    className="group border-muted hover:border-primary/30 hover:bg-primary/5 flex w-full cursor-pointer items-center gap-1.5 rounded-xl border-2 bg-white px-3 py-2 text-xs font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    <Download className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground truncate">
                      {part.name}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {part.tasks.length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Button
              className="shadow-primary/20 hover:shadow-primary/30 h-11 w-full shrink-0 rounded-xl text-sm font-semibold shadow-lg transition-all hover:shadow-xl"
              onClick={handleGenerate}
              disabled={columns.length === 0 || loading}
            >
              {loading ? (
                <span className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <Download className="ml-2 h-4 w-4" />
              )}
              {loading ? 'در حال آماده‌سازی...' : 'آماده‌سازی فایل‌ها'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

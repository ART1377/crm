// src/features/dashboard/components/industry-table.tsx

import { ArrowDown, ArrowUp, ArrowUpDown, PieChart, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';

import { cn } from '@/lib/utils';
import { SourceDetailPopover } from './source-detail-popover';

interface IndustryTableProps {
  entries: [string, Record<string, number>][];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (column: string) => void;
  sourceByIndustryAndStatus: {
    source: string;
    industry: string;
    status: string;
    _count: { id: number };
  }[];
}

const SORT_COLUMNS = [
  { key: 'total', label: 'کل' },
  ...LEAD_STATUSES.map((s) => ({ key: s.value, label: s.label })),
] as const;

const MAX_BAR_WIDTH = 60;

// وضعیت‌هایی که در ستون جمع نمایش داده میشن
const SUMMARY_STATUSES = ['CALLED', 'MESSAGED', 'FOLLOW_UP', 'CUSTOMER'];

export function IndustryTable({
  entries,
  sortBy,
  sortDirection,
  onSortChange,
  sourceByIndustryAndStatus,
}: IndustryTableProps) {
  // محاسبه مجموع کل برای درصد
  const grandTotal = entries.reduce(
    (sum, [, statuses]) => sum + Object.values(statuses).reduce((a, b) => a + b, 0),
    0
  );

  const maxTotal = Math.max(
    ...entries.map(([, statuses]) => Object.values(statuses).reduce((a, b) => a + b, 0)),
    1
  );

  const getPercentage = (value: number) => {
    if (grandTotal === 0) return 0;
    return (value / grandTotal) * 100;
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1);
  };

  const renderCell = (industry: string, statusKey: string, count: number) => {
    return (
      <SourceDetailPopover
        industry={industry}
        statusKey={statusKey}
        count={count}
        sourceByIndustryAndStatus={sourceByIndustryAndStatus}
        grandTotal={grandTotal}
      >
        {count}
      </SourceDetailPopover>
    );
  };

  // محاسبه مجموع هر ستون در کل صنایع
  const columnTotals: Record<string, number> = {};

  // مقداردهی اولیه
  columnTotals['total'] = 0;
  for (const status of LEAD_STATUSES) {
    columnTotals[status.value] = 0;
  }
  for (const status of SUMMARY_STATUSES) {
    columnTotals[status] = 0;
  }

  // محاسبه مجموع‌ها
  for (const [, statuses] of entries) {
    for (const [status, count] of Object.entries(statuses)) {
      columnTotals[status] = (columnTotals[status] || 0) + count;
      columnTotals['total'] = (columnTotals['total'] || 0) + count;
    }
  }

  // محاسبه summaryTotal برای ردیف جمع کل
  const summaryTotal = SUMMARY_STATUSES.reduce(
    (sum, status) => sum + (columnTotals[status] || 0),
    0
  );

  return (
    <Card className="border-border/60 min-h-fit flex-1 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <PieChart className="h-4 w-4 text-purple-500" />
          </div>
          وضعیت بر اساس صنعت
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-start">صنعت</TableHead>
              {SORT_COLUMNS.map(({ key, label }) => {
                const isActive = sortBy === key;
                return (
                  <TableHead
                    key={key}
                    className={cn(
                      'hover:text-foreground cursor-pointer text-center transition-colors',
                      isActive && 'text-foreground'
                    )}
                    onClick={() => onSortChange(key)}
                  >
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {label}
                      {isActive ? (
                        sortDirection === 'desc' ? (
                          <ArrowDown className="h-3 w-3 text-purple-500" />
                        ) : (
                          <ArrowUp className="h-3 w-3 text-purple-500" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-30" />
                      )}
                    </span>
                  </TableHead>
                );
              })}
              {/* ستون جدید جمع */}
              <TableHead className="text-center font-bold text-green-600">
                <span className="whitespace-nowrap">✅ جمع</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* ردیف‌های هر صنعت */}
            {entries.map(([industry, statuses], index) => {
              const total = Object.values(statuses).reduce((a, b) => a + b, 0);
              const barWidth = (total / maxTotal) * MAX_BAR_WIDTH;
              const totalPercent = getPercentage(total);

              // محاسبه جمع وضعیت‌های مشخص شده برای این صنعت
              const summaryTotal = SUMMARY_STATUSES.reduce(
                (sum, status) => sum + (statuses[status] ?? 0),
                0
              );
              const summaryPercent = getPercentage(summaryTotal);

              return (
                <TableRow
                  key={industry}
                  className={cn(
                    'group hover:bg-muted/50 relative transition-colors',
                    index % 2 === 0 && 'bg-muted/20'
                  )}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/leads?industry=${encodeURIComponent(industry)}`}
                      className="hover:text-primary block transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 items-center">
                          <div
                            className="h-1.5 rounded-full bg-purple-400/60 transition-all group-hover:bg-purple-500"
                            style={{ width: `${Math.max(barWidth, 4)}px` }}
                          />
                        </div>
                        <span className="truncate">{industry}</span>
                      </div>
                    </Link>
                  </TableCell>

                  {/* ستون کل با درصد */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                        {renderCell(industry, 'total', total)}
                        {total === maxTotal && total > 0 && (
                          <TrendingUp className="h-3 w-3 text-purple-400" />
                        )}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {formatPercent(totalPercent)}%
                      </span>
                    </div>
                  </TableCell>

                  {/* ستون‌های وضعیت با درصد */}
                  {LEAD_STATUSES.map(({ value, color }) => {
                    const count = statuses[value] ?? 0;
                    const percent = getPercentage(count);
                    return (
                      <TableCell key={value} className="text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums',
                              count ? color : 'text-muted-foreground/40'
                            )}
                          >
                            {renderCell(industry, value, count)}
                          </span>
                          {count > 0 && (
                            <span className="text-muted-foreground text-[9px]">
                              {formatPercent(percent)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}

                  {/* ستون جمع */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-green-600 tabular-nums">
                        {renderCell(industry, 'summary', summaryTotal)}
                        {summaryTotal > 0 && <TrendingUp className="h-3 w-3 text-green-400" />}
                      </span>
                      {summaryTotal > 0 && (
                        <span className="text-muted-foreground text-[9px]">
                          {formatPercent(summaryPercent)}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* ✅ ردیف جمع کل */}
            <TableRow className="bg-primary/5 border-primary/20 border-t-2 font-bold">
              <TableCell className="text-primary font-bold">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>جمع کل</span>
                </div>
              </TableCell>

              {/* جمع کل ستون کل */}
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="text-primary inline-flex items-center gap-1.5 font-semibold tabular-nums">
                    {renderCell('جمع کل', 'total', columnTotals['total'])}
                  </span>
                  <span className="text-muted-foreground text-[10px]">{formatPercent(100)}%</span>
                </div>
              </TableCell>

              {/* جمع کل هر وضعیت */}
              {LEAD_STATUSES.map(({ value, color }) => {
                const count = columnTotals[value] || 0;
                const percent = getPercentage(count);
                return (
                  <TableCell key={value} className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums',
                          count ? color : 'text-muted-foreground/40'
                        )}
                      >
                        {renderCell('جمع کل', value, count)}
                      </span>
                      {count > 0 && (
                        <span className="text-muted-foreground text-[9px]">
                          {formatPercent(percent)}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                );
              })}

              {/* جمع کل ستون جمع */}
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="inline-flex items-center gap-1 font-semibold text-green-600 tabular-nums">
                    {renderCell('جمع کل', 'summary', summaryTotal)}
                    {summaryTotal > 0 && <TrendingUp className="h-3 w-3 text-green-400" />}
                  </span>
                  {summaryTotal > 0 && (
                    <span className="text-muted-foreground text-[9px]">
                      {formatPercent(getPercentage(summaryTotal))}%
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

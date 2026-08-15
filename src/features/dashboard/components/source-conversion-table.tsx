// src/features/dashboard/components/source-conversion-table.tsx

'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { CONTACT_STATUSES } from '../utils/dashboard-utils';

const CONVERSION_STATUSES = ['CALLED', 'MESSAGED', 'FOLLOW_UP', 'CUSTOMER'];

const statusColors: Record<string, string> = {
  CALLED: 'bg-cyan-100 text-cyan-800',
  MESSAGED: 'bg-teal-100 text-teal-800',
  FOLLOW_UP: 'bg-purple-100 text-purple-800',
  CUSTOMER: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  CALLED: 'شماره گرفت',
  MESSAGED: 'پیام گذاشتم',
  FOLLOW_UP: 'در حال پیگیری',
  CUSTOMER: 'مشتری',
};

interface SourceConversionTableProps {
  data: {
    sourceMap: Record<string, Record<string, number>>;
    sourceTotals: Record<string, number>;
    statusTotals: Record<string, number>;
    sortedSources: string[];
  };
  totalLeads: number;
}

export function SourceConversionTable({ data, totalLeads }: SourceConversionTableProps) {
  const { sourceMap, sourceTotals, statusTotals, sortedSources } = data;

  // مجموع ۴ وضعیت اصلی
  const totalConverted = CONVERSION_STATUSES.reduce(
    (sum, status) => sum + (statusTotals[status] || 0),
    0
  );

  // مجموع سرنخ‌های تماس گرفته شده (شامل CALLED + CONTACTED + ...)
  const totalContacted = CONTACT_STATUSES.reduce(
    (sum, status) => sum + (statusTotals[status] || 0),
    0
  );

  // نرخ تبدیل کلی = (۴ وضعیت) / (کل سرنخ‌ها)
  const overallConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

  // نرخ بهره‌وری کلی = (۴ وضعیت) / (تماس گرفته‌ها)
  const overallEfficiencyRate = totalContacted > 0 ? (totalConverted / totalContacted) * 100 : 0;

  return (
    <Card className="col-span-full min-h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          نرخ تبدیل بر اساس منبع
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">منبع</TableHead>
              <TableHead className="text-center">مجموع</TableHead>
              {CONVERSION_STATUSES.map((status) => (
                <TableHead key={status} className="text-center whitespace-nowrap">
                  {statusLabels[status]}
                </TableHead>
              ))}
              <TableHead className="text-center text-green-600">✅ نرخ تبدیل</TableHead>
              <TableHead className="text-center text-blue-600">📊 نرخ بهره‌وری از تماس</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSources.map((source) => {
              const statuses = sourceMap[source];
              const total = sourceTotals[source] || 0;
              const converted = CONVERSION_STATUSES.reduce(
                (sum, status) => sum + (statuses[status] || 0),
                0
              );
              const contactedCount = CONTACT_STATUSES.reduce(
                (sum, status) => sum + (statuses[status] || 0),
                0
              );

              const conversionRate = total > 0 ? (converted / total) * 100 : 0;
              const efficiencyRate = contactedCount > 0 ? (converted / contactedCount) * 100 : 0;

              return (
                <TableRow key={source} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link
                      href={`/leads?source=${encodeURIComponent(source)}`}
                      className="hover:text-primary transition-colors"
                    >
                      {source}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{total}</TableCell>

                  {CONVERSION_STATUSES.map((status) => {
                    const count = statuses[status] || 0;
                    const percent = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <TableCell key={status} className="text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums',
                              count > 0 ? statusColors[status] : 'text-muted-foreground/40'
                            )}
                          >
                            {count}
                          </span>
                          {count > 0 && (
                            <span className="text-muted-foreground text-[9px]">
                              {percent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-semibold tabular-nums',
                          conversionRate >= 50 ? 'text-green-600' : 'text-orange-500'
                        )}
                      >
                        {conversionRate.toFixed(1)}%
                        {conversionRate >= 50 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-orange-500" />
                        )}
                      </span>
                      <span className="text-muted-foreground text-[9px]">
                        {converted} از {total}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-semibold tabular-nums',
                          efficiencyRate >= 50 ? 'text-blue-600' : 'text-blue-400'
                        )}
                      >
                        {efficiencyRate.toFixed(1)}%
                        {efficiencyRate >= 50 ? (
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-blue-400" />
                        )}
                      </span>
                      <span className="text-muted-foreground text-[9px]">
                        {converted} از {contactedCount}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* ردیف جمع کل */}
            <TableRow className="bg-primary/5 border-primary/20 border-t-2 font-bold">
              <TableCell className="text-primary">جمع کل</TableCell>
              <TableCell className="text-primary text-center">{totalLeads}</TableCell>

              {CONVERSION_STATUSES.map((status) => {
                const count = statusTotals[status] || 0;
                const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                return (
                  <TableCell key={status} className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums',
                          count > 0 ? statusColors[status] : 'text-muted-foreground/40'
                        )}
                      >
                        {count}
                      </span>
                      {count > 0 && (
                        <span className="text-muted-foreground text-[9px]">
                          {percent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                );
              })}

              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-semibold tabular-nums',
                      overallConversionRate >= 50 ? 'text-green-600' : 'text-orange-500'
                    )}
                  >
                    {overallConversionRate.toFixed(1)}%
                    {overallConversionRate >= 50 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-orange-500" />
                    )}
                  </span>
                  <span className="text-muted-foreground text-[9px]">
                    {totalConverted} از {totalLeads}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-semibold tabular-nums',
                      overallEfficiencyRate >= 50 ? 'text-blue-600' : 'text-blue-400'
                    )}
                  >
                    {overallEfficiencyRate.toFixed(1)}%
                    {overallEfficiencyRate >= 50 ? (
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-blue-400" />
                    )}
                  </span>
                  <span className="text-muted-foreground text-[9px]">
                    {totalConverted} از {totalContacted}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

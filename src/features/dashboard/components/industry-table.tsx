import { ArrowDown, ArrowUp, ArrowUpDown, PieChart, TrendingUp } from 'lucide-react';

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
import Link from 'next/link';

interface IndustryTableProps {
  entries: [string, Record<string, number>][];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (column: string) => void;
}

const SORT_COLUMNS = [
  { key: 'total', label: 'کل' },
  ...LEAD_STATUSES.map((s) => ({ key: s.value, label: s.label })),
] as const;

const MAX_BAR_WIDTH = 60;

export function IndustryTable({
  entries,
  sortBy,
  sortDirection,
  onSortChange,
}: IndustryTableProps) {
  const maxTotal = Math.max(
    ...entries.map(([, statuses]) => Object.values(statuses).reduce((a, b) => a + b, 0)),
    1
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
                    <span className="inline-flex items-center gap-1">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([industry, statuses], index) => {
              const total = Object.values(statuses).reduce((a, b) => a + b, 0);
              const barWidth = (total / maxTotal) * MAX_BAR_WIDTH;

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

                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                      {total}
                      {total === maxTotal && total > 0 && (
                        <TrendingUp className="h-3 w-3 text-purple-400" />
                      )}
                    </span>
                  </TableCell>
                  {LEAD_STATUSES.map(({ value, color }) => (
                    <TableCell key={value} className="text-center">
                      <span
                        className={cn(
                          'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums',
                          statuses[value] ? color : 'text-muted-foreground/40'
                        )}
                      >
                        {statuses[value] ?? 0}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

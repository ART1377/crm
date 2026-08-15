// src/features/dashboard/components/source-detail-popover.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { prepareSourceData, type SourceByIndustryAndStatusItem } from '../utils/dashboard-utils';

interface SourceDetailPopoverProps {
  industry: string;
  statusKey: string;
  count: number;
  sourceByIndustryAndStatus: SourceByIndustryAndStatusItem[];
  grandTotal: number;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end'; // جدید
}

export function SourceDetailPopover({
  industry,
  statusKey,
  count,
  sourceByIndustryAndStatus,
  grandTotal,
  children,
  align = 'center',
}: SourceDetailPopoverProps) {
  const statusDisplayMap: Record<string, string> = { total: 'کل', summary: 'جمع' };
  const statusLabel = statusDisplayMap[statusKey] || statusKey;

  const sourceData = prepareSourceData(sourceByIndustryAndStatus, industry, statusKey, count);

  const displayCount = count > 0 ? count : sourceData.reduce((sum, s) => sum + s.count, 0);
  const totalPercent = grandTotal > 0 ? (displayCount / grandTotal) * 100 : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer transition-opacity hover:opacity-80">{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align={align}>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="max-w-30 truncate text-sm font-medium">{industry}</span>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="text-muted-foreground grid grid-cols-3 gap-1 text-xs">
              <span className="text-right">منبع</span>
              <span className="text-center">تعداد</span>
              <span className="text-left">درصد</span>
            </div>

            {sourceData.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-xs">
                اطلاعاتی موجود نیست
              </div>
            ) : (
              sourceData.map((item) => (
                <div
                  key={item.source}
                  className="hover:bg-muted/50 grid grid-cols-3 gap-1 rounded-md px-1 py-1 text-xs"
                >
                  <span className="truncate text-right">{item.source}</span>
                  <span className="text-center font-medium tabular-nums">{item.count}</span>
                  <span className="text-muted-foreground text-left tabular-nums">
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-2">
            <div className="grid grid-cols-3 gap-1 text-xs font-medium">
              <span className="text-right">جمع</span>
              <span className="text-center">{displayCount}</span>
              <span className="text-muted-foreground text-left">{totalPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// src/features/dashboard/components/source-detail-popover.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SourceDetailPopoverProps {
  industry: string;
  statusKey: string;
  count: number;
  sourceByIndustryAndStatus: {
    source: string;
    industry: string;
    status: string;
    _count: { id: number };
  }[];
  grandTotal: number;
  children: React.ReactNode;
}

export function SourceDetailPopover({
  industry,
  statusKey,
  count,
  sourceByIndustryAndStatus,
  grandTotal,
  children,
}: SourceDetailPopoverProps) {
  // برای نمایش عنوان مناسب در Popover
  const statusDisplayMap: Record<string, string> = {
    total: 'کل',
    summary: 'جمع',
  };

  // پیدا کردن لیبل فارسی برای وضعیت
  const statusLabel = statusDisplayMap[statusKey] || statusKey;

  // فیلتر کردن داده‌ها
  let filteredData: typeof sourceByIndustryAndStatus = [];

  const isTotalRow = industry === 'جمع کل';

  if (statusKey === 'total') {
    // ستون کل: همه وضعیت‌ها
    filteredData = sourceByIndustryAndStatus.filter((item) => {
      if (isTotalRow) {
        return true; // برای ردیف جمع کل، همه داده‌ها
      }
      return item.industry === industry;
    });
  } else if (statusKey === 'summary') {
    // ستون جمع: فقط وضعیت‌های خاص
    const summaryStatuses = ['CALLED', 'MESSAGED', 'FOLLOW_UP', 'CUSTOMER'];
    filteredData = sourceByIndustryAndStatus.filter((item) => {
      if (isTotalRow) {
        return summaryStatuses.includes(item.status);
      }
      return item.industry === industry && summaryStatuses.includes(item.status);
    });
  } else {
    // ستون‌های وضعیت عادی
    filteredData = sourceByIndustryAndStatus.filter((item) => {
      if (isTotalRow) {
        return item.status === statusKey;
      }
      return item.industry === industry && item.status === statusKey;
    });
  }

  // گروه‌بندی بر اساس منبع و جمع‌آوری تعداد
  const sourceMap = new Map<string, number>();
  for (const item of filteredData) {
    const source = item.source || 'نامشخص';
    sourceMap.set(source, (sourceMap.get(source) || 0) + item._count.id);
  }

  // تبدیل به آرایه و مرتب‌سازی
  const sourceData = Array.from(sourceMap.entries())
    .map(([source, total]) => {
      const percent = count > 0 ? (total / count) * 100 : 0;
      return { source, count: total, percent };
    })
    .sort((a, b) => b.count - a.count);

  const displayCount = count > 0 ? count : sourceData.reduce((sum, s) => sum + s.count, 0);
  const totalPercent = grandTotal > 0 ? (displayCount / grandTotal) * 100 : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer transition-opacity hover:opacity-80">{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="max-w-30 truncate text-sm font-medium">{industry}</span>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>منبع</span>
              <span>تعداد</span>
              <span>درصد</span>
            </div>

            {sourceData.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-xs">
                اطلاعاتی موجود نیست
              </div>
            ) : (
              sourceData.map((item) => (
                <div
                  key={item.source}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md px-1 py-1 text-xs"
                >
                  <span className="max-w-25 truncate">{item.source}</span>
                  <span className="font-medium tabular-nums">{item.count}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>جمع</span>
              <span>{displayCount}</span>
              <span className="text-muted-foreground">{totalPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

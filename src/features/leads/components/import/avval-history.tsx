// src/features/leads/components/import/avval-history.tsx

'use client';

import { History, Loader2, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  useAvvalHistory,
  useClearAvvalHistory,
  useDeleteAvvalHistory,
} from '@/features/leads/hooks/use-avval-history';

import { formatDate } from '@/lib/utils';

interface AvvalHistoryProps {
  onSelect: (slug: string, industry: string) => void;
}

export function AvvalHistory({ onSelect }: AvvalHistoryProps) {
  const { data: history = [], isLoading } = useAvvalHistory();
  const deleteOne = useDeleteAvvalHistory();
  const clearAll = useClearAvvalHistory();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-4">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
          <History className="h-4 w-4 opacity-50" />
          هنوز جستجویی ثبت نشده
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2.5">
        <CardTitle className="flex items-center gap-2 text-xs font-medium">
          <History className="h-3.5 w-3.5" />
          جستجوهای قبلی ({history.length})
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearAll.mutate()}
          disabled={clearAll.isPending}
          className="text-muted-foreground hover:text-destructive h-6 gap-1 px-2 text-[10px]"
        >
          {clearAll.isPending ? (
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
          ) : (
            <RotateCcw className="h-2.5 w-2.5" />
          )}
          پاک کردن همه
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="group border-muted hover:border-primary/30 hover:bg-primary/5 flex items-center gap-1 rounded-full border bg-white py-1 pr-1 pl-2.5 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelect(item.slug, item.industry)}
                className="flex items-center gap-1.5 text-right"
                title={`${item.slug} — ${item.industry} — ${formatDate(new Date(item.lastSearchedAt))}`}
              >
                <span className="text-[11px] font-medium" dir="ltr">
                  {item.slug}
                </span>
                <span className="text-muted-foreground text-[10px]">•</span>
                <span className="text-muted-foreground text-[10px]">{item.industry}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteOne.mutate(item.id)}
                disabled={deleteOne.isPending}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors"
                title="حذف"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

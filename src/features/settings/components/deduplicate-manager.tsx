// src/features/settings/components/deduplicate-manager.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Merge, X } from 'lucide-react';

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';

import { useDeduplicate } from '../hooks/use-deduplicate';

function getStatusConfig(status: string) {
  return LEAD_STATUSES.find((s) => s.value === status);
}

export function DeduplicateManager() {
  const { duplicates, ignored, loading, merging, handleScan, handleMerge, handleIgnore } =
    useDeduplicate();

  const visibleDuplicates = duplicates.filter((d) => !ignored.has(`${d.lead1.id}-${d.lead2.id}`));

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-red-100 text-red-800';
    if (similarity >= 75) return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'phone':
        return 'شماره مشابه';
      case 'name':
        return 'نام مشابه';
      case 'both':
        return 'شماره و نام';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            تشخیص تکراری‌ها
            {duplicates.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {visibleDuplicates.length} از {duplicates.length}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={handleScan} disabled={loading}>
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            بررسی سرنخ‌های تکراری
          </Button>
        </CardHeader>
        <CardContent>
          {duplicates.length === 0 && !loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              برای پیدا کردن موارد تکراری، روی دکمه بالا کلیک کنید
            </p>
          ) : visibleDuplicates.length === 0 && duplicates.length > 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              همه موارد بررسی شدن. دوباره اسکن کنید.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">سرنخ ۱</TableHead>
                  <TableHead className="text-start">سرنخ ۲</TableHead>
                  <TableHead className="text-center">شباهت</TableHead>
                  <TableHead className="text-center">نوع</TableHead>
                  <TableHead className="text-center">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleDuplicates.map((dup, index) => {
                  const key = `${dup.lead1.id}-${dup.lead2.id}`;
                  const isMerging =
                    merging?.lead1Id === dup.lead1.id && merging?.lead2Id === dup.lead2.id;
                  const isMergingReverse =
                    merging?.lead1Id === dup.lead2.id && merging?.lead2Id === dup.lead1.id;
                  const status1 = getStatusConfig(dup.lead1.status);
                  const status2 = getStatusConfig(dup.lead2.status);

                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[10px]">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{dup.lead1.businessName}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <Badge className={status1?.color || 'bg-gray-100 text-[10px]'}>
                                {status1?.label || dup.lead1.status}
                              </Badge>
                              <span className="text-muted-foreground text-[10px]">
                                {dup.lead1.industry}
                              </span>
                              <span className="text-muted-foreground text-[10px]" dir="ltr">
                                {dup.lead1.phoneNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{dup.lead2.businessName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge className={status2?.color || 'bg-gray-100 text-[10px]'}>
                            {status2?.label || dup.lead2.status}
                          </Badge>
                          <span className="text-muted-foreground text-[10px]">
                            {dup.lead2.industry}
                          </span>
                          <span className="text-muted-foreground text-[10px]" dir="ltr">
                            {dup.lead2.phoneNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getSimilarityColor(dup.similarity)}>
                          {dup.similarity}٪
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {getMatchTypeLabel(dup.matchType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => handleMerge(dup.lead1.id, dup.lead2.id)}
                            disabled={!!isMerging || !!isMergingReverse}
                          >
                            {isMerging ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Merge className="h-3 w-3" />
                            )}
                            نگه داشتن ۱
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => handleMerge(dup.lead2.id, dup.lead1.id)}
                            disabled={!!isMerging || !!isMergingReverse}
                          >
                            {isMergingReverse ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Merge className="h-3 w-3 rotate-180" />
                            )}
                            نگه داشتن ۲
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIgnore(dup.lead1.id, dup.lead2.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// src/features/dashboard/utils/dashboard-utils.ts

import { LEAD_STATUSES } from '@/features/leads/constants/leads-constants';

export type IndustryEntry = [string, Record<string, number>];

export interface SourceByIndustryItem {
  source: string;
  industry: string;
  _count: { id: number };
}

export interface SourceByIndustryAndStatusItem {
  source: string;
  industry: string;
  status: string;
  _count: { id: number };
}

export interface SourceConversionItem {
  source: string;
  status: string;
  _count: { id: number };
}

export interface IndustryStatsItem {
  industry: string;
  status: string;
  _count: { id: number };
}

export const SUMMARY_STATUSES = ['CALLED', 'MESSAGED', 'FOLLOW_UP', 'CUSTOMER'];

export function buildIndustryMap(
  industryStats: IndustryStatsItem[]
): Record<string, Record<string, number>> {
  const map: Record<string, Record<string, number>> = {};
  for (const item of industryStats) {
    if (!map[item.industry]) map[item.industry] = {};
    map[item.industry][item.status] = (map[item.industry][item.status] || 0) + item._count.id;
  }
  return map;
}

export function calculateGrandTotal(entries: IndustryEntry[]): number {
  return entries.reduce(
    (sum, [, statuses]) => sum + Object.values(statuses).reduce((a, b) => a + b, 0),
    0
  );
}

export function calculateColumnTotals(entries: IndustryEntry[]): Record<string, number> {
  const totals: Record<string, number> = { total: 0 };
  for (const status of LEAD_STATUSES) totals[status.value] = 0;
  for (const status of SUMMARY_STATUSES) totals[status] = 0;

  for (const [, statuses] of entries) {
    for (const [status, count] of Object.entries(statuses)) {
      totals[status] = (totals[status] || 0) + count;
      totals.total += count;
    }
  }
  return totals;
}

export function getSummaryTotal(totals: Record<string, number>): number {
  return SUMMARY_STATUSES.reduce((sum, status) => sum + (totals[status] || 0), 0);
}

export function prepareSourceData(
  sourceByIndustryAndStatus: SourceByIndustryAndStatusItem[],
  industry: string,
  statusKey: string,
  count: number
): Array<{ source: string; count: number; percent: number }> {
  const isTotalRow = industry === 'جمع کل';
  let filteredData: SourceByIndustryAndStatusItem[] = [];

  if (statusKey === 'total') {
    filteredData = sourceByIndustryAndStatus.filter((item) =>
      isTotalRow ? true : item.industry === industry
    );
  } else if (statusKey === 'summary') {
    filteredData = sourceByIndustryAndStatus.filter((item) =>
      isTotalRow
        ? SUMMARY_STATUSES.includes(item.status)
        : item.industry === industry && SUMMARY_STATUSES.includes(item.status)
    );
  } else {
    filteredData = sourceByIndustryAndStatus.filter((item) =>
      isTotalRow
        ? item.status === statusKey
        : item.industry === industry && item.status === statusKey
    );
  }

  const sourceMap = new Map<string, number>();
  for (const item of filteredData) {
    const source = item.source || 'نامشخص';
    sourceMap.set(source, (sourceMap.get(source) || 0) + item._count.id);
  }

  const totalCount = count > 0 ? count : Array.from(sourceMap.values()).reduce((a, b) => a + b, 0);
  return Array.from(sourceMap.entries())
    .map(([source, total]) => ({
      source,
      count: total,
      percent: totalCount > 0 ? (total / totalCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function prepareConversionData(data: SourceConversionItem[]): {
  sourceMap: Record<string, Record<string, number>>;
  sourceTotals: Record<string, number>;
  statusTotals: Record<string, number>;
  sortedSources: string[];
} {
  const sourceMap: Record<string, Record<string, number>> = {};
  const statusTotals: Record<string, number> = {};
  for (const status of SUMMARY_STATUSES) statusTotals[status] = 0;

  for (const item of data) {
    const source = item.source || 'نامشخص';
    if (!sourceMap[source]) sourceMap[source] = {};
    sourceMap[source][item.status] = (sourceMap[source][item.status] || 0) + item._count.id;
    if (SUMMARY_STATUSES.includes(item.status)) {
      statusTotals[item.status] = (statusTotals[item.status] || 0) + item._count.id;
    }
  }

  const sourceTotals: Record<string, number> = {};
  for (const [source, statuses] of Object.entries(sourceMap)) {
    sourceTotals[source] = Object.values(statuses).reduce((a, b) => a + b, 0);
  }

  const sortedSources = Object.keys(sourceMap).sort(
    (a, b) => (sourceTotals[b] || 0) - (sourceTotals[a] || 0)
  );

  return { sourceMap, sourceTotals, statusTotals, sortedSources };
}

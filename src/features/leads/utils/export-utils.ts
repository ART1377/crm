// src/features/leads/utils/export-utils.ts

import { formatDate } from '@/lib/utils';

import { LEAD_STATUSES } from '../constants/leads-constants';
import { Lead } from '../types/leads-types';

export const ALL_COLUMNS = [
  { key: 'businessName', label: 'نام کسب‌وکار' },
  { key: 'contactPerson', label: 'شخص تماس' },
  { key: 'phoneNumber', label: 'شماره اصلی' },
  { key: 'secondaryPhone', label: 'شماره دوم' },
  { key: 'industry', label: 'صنعت' },
  { key: 'source', label: 'منبع' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ ثبت' },
] as const;

export type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

export const DEFAULT_COLUMNS: ColumnKey[] = [
  'businessName',
  'phoneNumber',
  'industry',
  'source',
  'status',
];

function normalizePhoneNumber(value: string): string {
  if (!value) return '';
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[^\d]/g, '');
}

function getCellValue(lead: Lead, key: ColumnKey): string {
  switch (key) {
    case 'businessName':
      return lead.businessName;
    case 'contactPerson':
      return lead.contactPerson || '';
    case 'phoneNumber':
      return normalizePhoneNumber(lead.phoneNumber);
    case 'secondaryPhone':
      return normalizePhoneNumber(lead.secondaryPhone || '');
    case 'industry':
      return lead.industry;
    case 'source':
      return lead.source || '';
    case 'status':
      return LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;
    case 'createdAt':
      return formatDate(new Date(lead.createdAt));
    default:
      return '';
  }
}

export function exportToText(leads: Lead[], columns: ColumnKey[], fileName?: string) {
  // Filter out businessName from columns since it's already in the header
  const dataColumns = columns; // keep all, businessName is in the title line

  const lines = leads.map((lead, index) => {
    const items = dataColumns
      .map((key) => {
        const value = getCellValue(lead, key);
        if (!value) return null;
        const label = ALL_COLUMNS.find((c) => c.key === key)!.label;
        return `  ${label}: ${value}`;
      })
      .filter(Boolean);
    return [`${index + 1}. 📋 ${lead.businessName}`, ...items, ''].join('\n');
  });

  const content = `گزارش سرنخ‌ها - ${new Date().toLocaleDateString('fa-IR')}\n${'='.repeat(40)}\n\n${lines.join('\n')}`;
  const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName
    ? `${fileName}.txt`
    : `leads-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(leads: Lead[], columns: ColumnKey[], fileName?: string) {
  const headers = columns.map((key) => ALL_COLUMNS.find((c) => c.key === key)!.label);
  const rows = leads.map((lead) =>
    columns.map((key) => {
      const value = getCellValue(lead, key);
      if (key === 'phoneNumber' || key === 'secondaryPhone') {
        return value ? `=""${value}""` : '';
      }
      return value;
    })
  );
  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => String(cell)).join(',')),
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName
    ? `${fileName}.csv`
    : `leads-${formatDate(new Date()).replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

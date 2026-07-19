// src/features/leads/utils/export-utils.ts

import { formatDate } from '@/lib/utils';
import { LEAD_STATUSES } from '../constants/leads-constants';
import { Lead } from '../types/leads-types';

const BASE_URL = 'https://crm-tan-nine.vercel.app';

export const ALL_COLUMNS = [
  { key: 'businessName', label: 'نام کسب‌وکار' },
  { key: 'contactPerson', label: 'شخص تماس' },
  { key: 'phoneNumber', label: 'شماره اصلی' },
  { key: 'secondaryPhone', label: 'شماره دوم' },
  { key: 'industry', label: 'صنعت' },
  { key: 'source', label: 'منبع' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ ثبت' },
  { key: 'individualLink', label: 'لینک فردی' },
  { key: 'batchLink', label: 'لینک گروهی' },
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
    case 'individualLink':
      return `${BASE_URL}/leads/${lead.id}`;
    case 'batchLink':
      return '';
    default:
      return '';
  }
}

export function exportToText(leads: Lead[], columns: ColumnKey[], fileName?: string) {
  const ids = leads.map((l) => l.id).join(',');
  const batchLink = `${BASE_URL}/leads?ids=${ids}`;
  const hasBatchLink = columns.includes('batchLink');
  const dataColumns = columns.filter((c) => c !== 'batchLink');

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

  const headerParts = [`گزارش سرنخ‌ها - ${new Date().toLocaleDateString('fa-IR')}`, '='.repeat(40)];

  if (hasBatchLink) {
    headerParts.push('', `🔗 لینک اختصاصی این فایل:`, batchLink, '', '='.repeat(40));
  }

  const content = [...headerParts, '', ...lines].join('\n');

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
  const hasBatchLink = columns.includes('batchLink');
  const dataColumns = columns.filter((c) => c !== 'batchLink');
  const headers = dataColumns.map((key) => ALL_COLUMNS.find((c) => c.key === key)!.label);

  const rows = leads.map((lead) =>
    dataColumns.map((key) => {
      const value = getCellValue(lead, key);
      if (key === 'phoneNumber' || key === 'secondaryPhone') {
        return value ? `=""${value}""` : '';
      }
      return value;
    })
  );

  let csvLines: string[] = [];

  if (hasBatchLink) {
    const ids = leads.map((l) => l.id).join(',');
    const batchLink = `${BASE_URL}/leads?ids=${ids}`;
    csvLines.push(`"🔗 لینک اختصاصی: ${batchLink}"`);
  }

  csvLines = [
    headers.map((h) => `"${h}"`).join(','),
    ...csvLines,
    ...rows.map((row) => row.map((cell) => String(cell)).join(',')),
  ];

  const csvContent = csvLines.join('\n');
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

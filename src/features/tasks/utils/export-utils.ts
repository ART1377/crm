// src/features/tasks/utils/export-utils.ts

import { formatDate } from '@/lib/utils';
import { Task } from '../types/tasks-types';

export const ALL_COLUMNS = [
  { key: 'title', label: 'عنوان تسک' },
  { key: 'leadName', label: 'نام سرنخ' },
  { key: 'contactPerson', label: 'شخص تماس' },
  { key: 'phoneNumber', label: 'شماره تماس' },
  { key: 'secondaryPhone', label: 'شماره دوم' },
  { key: 'dueDate', label: 'تاریخ سررسید' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ ایجاد' },
] as const;

export type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

function getCellValue(task: Task, key: ColumnKey): string {
  switch (key) {
    case 'title':
      return task.title;
    case 'leadName':
      return task.lead?.businessName || '';
    case 'contactPerson':
      return task.lead?.contactPerson || '';
    case 'phoneNumber':
      return task.lead?.phoneNumber || '';
    case 'secondaryPhone':
      return task.lead?.secondaryPhone || '';
    case 'dueDate':
      return formatDate(new Date(task.dueDate));
    case 'status':
      return task.isCompleted ? 'انجام شده' : 'در انتظار';
    case 'createdAt':
      return formatDate(new Date(task.createdAt));
    default:
      return '';
  }
}

export function exportToText(tasks: Task[], columns: ColumnKey[], fileName?: string) {
  const lines = tasks.map((task, index) => {
    const items = columns
      .map((key) => {
        const value = getCellValue(task, key);
        if (!value) return null;
        const label = ALL_COLUMNS.find((c) => c.key === key)!.label;
        return `  ${label}: ${value}`;
      })
      .filter(Boolean);
    return [`${index + 1}. 📋 ${task.title}`, ...items, ''].join('\n');
  });

  const headerParts = [`گزارش تسک‌ها - ${new Date().toLocaleDateString('fa-IR')}`, '='.repeat(40)];

  const content = [...headerParts, '', ...lines].join('\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName
    ? `${fileName}.txt`
    : `tasks-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(tasks: Task[], columns: ColumnKey[], fileName?: string) {
  const headers = columns.map((key) => ALL_COLUMNS.find((c) => c.key === key)!.label);

  const rows = tasks.map((task) =>
    columns.map((key) => {
      const value = getCellValue(task, key);
      if (key === 'phoneNumber' || key === 'secondaryPhone') {
        return value ? `=""${value}""` : '';
      }
      return value;
    })
  );

  const csvLines = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => String(cell)).join(',')),
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName
    ? `${fileName}.csv`
    : `tasks-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

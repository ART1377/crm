import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { OVERDUE_DAYS } from '../constants/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تابع کمکی برای فرمت کردن تاریخ شمسی به وقت ایران
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
    hour12: false,
  };

  return new Intl.DateTimeFormat('fa-IR', options).format(d);
}

// نسخه ساده‌تر - فقط تاریخ بدون ساعت
export function formatDateOnly(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tehran',
  }).format(d);
}

// تابع کمکی برای دیپ لینک پیام‌رسان‌ها
const DEFAULT_LINKS: Record<string, string> = {
  WHATSAPP: 'https://wa.me/{phone}?text={message}',
  ETA: 'https://eitaa.com/share?url={message}',
  BALE: 'https://ble.ir/share?text={message}',
  RUBIKA: 'https://rubika.ir/share?text={message}',
  SMS: 'sms:{phone}?body={message}',
};

export function getMessengerLink(
  type: string,
  phone: string,
  message: string,
  linkTemplate?: string
): string {
  const template = linkTemplate || DEFAULT_LINKS[type] || DEFAULT_LINKS.WHATSAPP;
  return template
    .replace('{phone}', phone.replace(/[^0-9]/g, ''))
    .replace('{message}', encodeURIComponent(message));
}

export function replaceTemplateVars(
  template: string,
  vars: {
    senderName: string;
    senderPhone: string;
    senderCompany: string;
    companyName: string;
    contactPerson?: string | null;
  }
): string {
  let result = template;

  result = result.replace(/\{senderName\}/g, vars.senderName);
  result = result.replace(/\{senderPhone\}/g, vars.senderPhone);
  result = result.replace(/\{senderCompany\}/g, vars.senderCompany);

  if (!vars.contactPerson) {
    result = result.replace(/خدمت \{contactPerson\} عزیز\n?/g, '');
    result = result.replace(/\{contactPerson\}/g, '');
  } else {
    result = result.replace(/\{contactPerson\}/g, vars.contactPerson);
  }

  if (!vars.companyName) {
    result = result.replace(/با مجموعه \{companyName\}/g, '');
    result = result.replace(/\{companyName\}/g, '');
  } else {
    result = result.replace(/\{companyName\}/g, vars.companyName);
  }

  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

export function countOverdueTasks(tasks?: { isCompleted: boolean; dueDate: string }[]): number {
  if (!tasks?.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks.filter((t) => {
    if (t.isCompleted) return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > OVERDUE_DAYS;
  }).length;
}


export function generateVCard(
  businessName: string,
  phoneNumber: string,
  options?: {
    contactPerson?: string | null;
    secondaryPhone?: string | null;
    organization?: string;
    notes?: string | null;
  }
): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // اسم: اگر شخص تماس هست → "شخص تماس_نام شرکت"، وگرنه فقط نام شرکت
  if (options?.contactPerson) {
    lines.push(`FN:${options.contactPerson}_${businessName}`);
  } else {
    lines.push(`FN:${businessName}`);
  }

  // شماره اصلی - تشخیص موبایل یا ثابت
  const primaryClean = phoneNumber.replace(/[^0-9]/g, '');
  if (primaryClean.startsWith('09') && primaryClean.length >= 10) {
    lines.push(`TEL;TYPE=CELL:${primaryClean}`); // موبایل
  } else if (primaryClean.startsWith('09')) {
    lines.push(`TEL;TYPE=CELL:${primaryClean}`);
  } else {
    lines.push(`TEL;TYPE=WORK:${primaryClean}`); // ثابت
  }

  // شماره دوم (اگه باشه)
  if (options?.secondaryPhone) {
    const secondaryClean = options.secondaryPhone.replace(/[^0-9]/g, '');
    if (secondaryClean.startsWith('09') && secondaryClean.length >= 10) {
      lines.push(`TEL;TYPE=CELL:${secondaryClean}`);
    } else {
      lines.push(`TEL;TYPE=WORK:${secondaryClean}`);
    }
  }

  // سازمان
  if (options?.organization) {
    lines.push(`ORG:${options.organization}`);
  }

  // یادداشت
  if (options?.notes) {
    lines.push(`NOTE:${options.notes}`);
  }

  lines.push('END:VCARD');
  return lines.join('\n');
}

export function downloadVCard(lead: {
  businessName: string;
  phoneNumber: string;
  contactPerson?: string | null;
  secondaryPhone?: string | null;
  industry?: string;
  notes?: string | null;
}) {
  const vCardData = generateVCard(lead.businessName, lead.phoneNumber, {
    contactPerson: lead.contactPerson,
    secondaryPhone: lead.secondaryPhone,
    organization: lead.industry || '',
    notes: lead.notes || undefined,
  });

  // اسم فایل: اگه شخص تماس هست → "شخص تماس_نام شرکت"
  const fileName = lead.contactPerson
    ? `${lead.contactPerson}_${lead.businessName}`
    : lead.businessName;

  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

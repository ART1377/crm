// src/lib/phone-utils.ts

/**
 * نرمال‌سازی شماره تلفن برای تطبیق
 * - اعداد فارسی/عربی → انگلیسی
 * - حذف همه غیررقم‌ها
 * - تبدیل +98 / 0098 / 98 → 0
 * - موبایل بدون 0 (912...) → 0912...
 */
export function normalizePhoneForMatch(input: string | null | undefined): string | null {
  if (!input) return null;

  // تبدیل اعداد فارسی و عربی به انگلیسی + حذف غیررقم
  let p = input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1584))
    .replace(/\D/g, '');

  if (!p) return null;

  // حذف 00 ابتدای شماره
  if (p.startsWith('00')) p = p.slice(2);

  // کد کشور ایران (98) → 0
  if (p.startsWith('98') && p.length >= 12) {
    p = '0' + p.slice(2);
  }
  // موبایل بدون صفر (912...) → 0912...
  else if (p.startsWith('9') && p.length === 10) {
    p = '0' + p;
  }

  return p;
}

/**
 * استخراج شماره‌ها از فایل vCard
 * - پشتیبانی از BEGIN:VCARD...END:VCARD چندگانه
 * - TEL با هر فرمت (TYPE=CELL, VALUE=uri, ...)
 */
export function parseVCardPhones(vcfText: string): string[] {
  const phones = new Set<string>();

  const lines = vcfText.split(/\r?\n/);

  for (const line of lines) {
    // فقط خطوط TEL (شامل TEL;TYPE=...)
    if (!/^TEL/i.test(line.trim())) continue;

    // مقدار بعد از آخرین ":" (چون ممکن است TEL;VALUE=uri:tel:+98... باشد)
    const idx = line.lastIndexOf(':');
    if (idx === -1) continue;

    const rawValue = line.slice(idx + 1).trim();
    if (!rawValue) continue;

    // ممکن است چند شماره با ; یا , جدا شده باشند
    for (const part of rawValue.split(/[;,]/)) {
      const normalized = normalizePhoneForMatch(part);
      if (normalized) phones.add(normalized);
    }
  }

  return Array.from(phones);
}

/**
 * استخراج شماره‌ها از متن آزاد (fallback)
 * الگوهای رایج ایرانی: 09xxxxxxxxx / +989xxxxxxxxx / 00989xxxxxxxxx
 */
export function extractPhonesFromText(text: string): string[] {
  const phones = new Set<string>();
  const matches = text.match(/(?:\+?98|0098|0)?9\d{9}/g) ?? [];

  for (const match of matches) {
    const normalized = normalizePhoneForMatch(match);
    if (normalized && normalized.length === 11) phones.add(normalized);
  }

  return Array.from(phones);
}

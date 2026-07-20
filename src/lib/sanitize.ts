// src/lib/sanitize.ts

export function toEnglishDigits(str: string): string {
  return str.replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));
}

export function sanitizePhone(phone: string): string {
  if (!phone) return '';

  let cleaned = toEnglishDigits(phone).replace(/[^0-9]/g, '');

  // +98914... → 0914...
  if (cleaned.startsWith('98') && cleaned.length > 10) {
    cleaned = '0' + cleaned.slice(2);
  }

  return cleaned;
}

export function sanitizeText(str: string): string {
  return (str || '').replace(/\u200C/g, ' ').trim();
}

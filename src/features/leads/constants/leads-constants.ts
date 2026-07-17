export const LEAD_SOURCES = [
  { value: 'بلد', label: 'بلد' },
  { value: 'نشان', label: 'نشان' },
  { value: 'ایران سایت', label: 'ایران سایت' },
  { value: 'نیاز روز', label: 'نیاز روز' },
  { value: 'کتاب اول', label: 'کتاب اول' },
  { value: 'اینستاگرام', label: 'اینستاگرام' },
  { value: 'سایر دایرکتوری‌ها', label: 'سایر دایرکتوری‌ها' },
  { value: 'مستقیم', label: 'مستقیم' },
] as const;

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'جدید', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'تماس گرفته شد', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CALLED', label: 'شماره گرفت', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'MESSAGED', label: 'پیام گذاشتم', color: 'bg-teal-100 text-teal-800' },
  { value: 'FOLLOW_UP', label: 'در حال پیگیری', color: 'bg-purple-100 text-purple-800' },
  { value: 'CUSTOMER', label: 'مشتری', color: 'bg-green-100 text-green-800' },
] as const;

export const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'تماس تلفنی' },
  { value: 'MESSAGE', label: 'ارسال پیام' },
  { value: 'NOTE', label: 'یادداشت' },
  { value: 'STATUS_CHANGE', label: 'تغییر وضعیت' },
] as const;


export const LEAD_SOURCES = [
  { value: 'IRAN_SITE', label: 'ایران سایت' },
  { value: 'NIAZ_ROOZ', label: 'نیاز روز' },
  { value: 'KETAB_AVAL', label: 'کتاب اول' },
  { value: 'INSTAGRAM', label: 'اینستاگرام' },
  { value: 'OTHER_DIRECTORY', label: 'سایر دایرکتوری‌ها' },
  { value: 'DIRECT', label: 'مستقیم' },
] as const

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'جدید', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'تماس گرفته شد', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'FOLLOW_UP', label: 'در حال پیگیری', color: 'bg-purple-100 text-purple-800' },
  { value: 'NEGOTIATION', label: 'در حال مذاکره', color: 'bg-orange-100 text-orange-800' },
  { value: 'CUSTOMER', label: 'مشتری', color: 'bg-green-100 text-green-800' },
  { value: 'NOT_INTERESTED', label: 'عدم علاقه', color: 'bg-gray-100 text-gray-800' },
  { value: 'INVALID', label: 'اطلاعات اشتباه', color: 'bg-red-100 text-red-800' },
] as const

export const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'تماس تلفنی' },
  { value: 'MESSAGE', label: 'ارسال پیام' },
  { value: 'NOTE', label: 'یادداشت' },
  { value: 'STATUS_CHANGE', label: 'تغییر وضعیت' },
] as const

export const MESSENGER_TYPES = [
  { value: 'WHATSAPP', label: 'واتساپ' },
  { value: 'ETA', label: 'ایتا' },
  { value: 'BALE', label: 'بله' },
  { value: 'RUBIKA', label: 'روبیکا' },
  { value: 'SMS', label: 'پیامک' },
] as const

export const DEFAULT_SENDER = {
  name: 'صادقی',
  phone: '09191234567',
  company: 'حسابداری کیهان',
}

export const TEMPLATE_PURPOSES = [
  { value: "INITIAL", label: "معرفی اولیه" },
  { value: "FOLLOW_UP", label: "پیگیری" },
  { value: "CLOSING", label: "تشکر نهایی" },
  { value: "CUSTOM", label: "سفارشی" },
];

export const LEADS_PAGE_SIZE = 10;
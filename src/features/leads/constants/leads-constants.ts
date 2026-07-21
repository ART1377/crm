export const LEAD_STATUSES = [
  { value: 'NEW', label: 'جدید', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'تماس گرفته شد', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CALLED', label: 'شماره گرفت', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'MESSAGED', label: 'پیام گذاشتم', color: 'bg-teal-100 text-teal-800' },
  { value: 'FOLLOW_UP', label: 'در حال پیگیری', color: 'bg-purple-100 text-purple-800' },
  { value: 'CUSTOMER', label: 'مشتری', color: 'bg-green-100 text-green-800' },
] as const;

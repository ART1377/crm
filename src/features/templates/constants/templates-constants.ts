export const MESSENGER_TYPES = [
  { value: "WHATSAPP", label: "واتساپ" },
  { value: "ETA", label: "ایتا" },
  { value: "BALE", label: "بله" },
  { value: "RUBIKA", label: "روبیکا" },
  { value: "SMS", label: "پیامک" },
] as const;

export const TEMPLATE_PURPOSES = [
  { value: "INITIAL", label: "معرفی اولیه" },
  { value: "FOLLOW_UP", label: "پیگیری" },
  { value: "CLOSING", label: "تشکر نهایی" },
  { value: "CUSTOM", label: "سفارشی" },
] as const;

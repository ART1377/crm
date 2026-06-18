// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تابع کمکی برای فرمت کردن تاریخ شمسی (بعداً تکمیل می‌شه)
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR').format(new Date(date))
}

// تابع کمکی برای دیپ لینک پیام‌رسان‌ها
export function getMessengerLink(type: string, phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  
  switch (type) {
    case 'WHATSAPP':
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    case 'ETA':
      return `https://eitaa.com/share?url=${encodedMessage}`
    case 'BALE':
      return `https://ble.ir/share?text=${encodedMessage}`
    case 'RUBIKA':
      return `https://rubika.ir/share?text=${encodedMessage}`
    case 'SMS':
      return `sms:${cleanPhone}?body=${encodedMessage}`
    default:
      return '#'
  }
}
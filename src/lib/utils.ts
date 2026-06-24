// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OVERDUE_DAYS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تابع کمکی برای فرمت کردن تاریخ شمسی (بعداً تکمیل می‌شه)
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR").format(new Date(date));
}

// تابع کمکی برای دیپ لینک پیام‌رسان‌ها
const DEFAULT_LINKS: Record<string, string> = {
  WHATSAPP: "https://wa.me/{phone}?text={message}",
  ETA: "https://eitaa.com/share?url={message}",
  BALE: "https://ble.ir/share?text={message}",
  RUBIKA: "https://rubika.ir/share?text={message}",
  SMS: "sms:{phone}?body={message}",
};

export function getMessengerLink(
  type: string,
  phone: string,
  message: string,
  linkTemplate?: string
): string {
  const template = linkTemplate || DEFAULT_LINKS[type] || DEFAULT_LINKS.WHATSAPP;
  return template
    .replace("{phone}", phone.replace(/[^0-9]/g, ""))
    .replace("{message}", encodeURIComponent(message));
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
    result = result.replace(/خدمت \{contactPerson\} عزیز\n?/g, "");
    result = result.replace(/\{contactPerson\}/g, "");
  } else {
    result = result.replace(/\{contactPerson\}/g, vars.contactPerson);
  }

  if (!vars.companyName) {
    result = result.replace(/با مجموعه \{companyName\}/g, "");
    result = result.replace(/\{companyName\}/g, "");
  } else {
    result = result.replace(/\{companyName\}/g, vars.companyName);
  }

  result = result.replace(/\n{3,}/g, "\n\n").trim();

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
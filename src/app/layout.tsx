// src/app/layout.tsx
import { Toaster } from "react-hot-toast";

import type { Metadata } from "next";

import { QueryProvider } from "@/providers/query-provider";

import { Navbar } from "@/components/layout/navbar";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CRM مدیریت سرنخ‌ها",
  description: "سیستم مدیریت ارتباط با مشتریان برای فروش تلفنی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-screen overflow-hidden">
      <body className="bg-background h-screen overflow-hidden">
        <QueryProvider>
          <div className="flex h-screen max-h-screen">
            <Navbar />
            <main className="flex-1 overflow-hidden">{children}</main>{" "}
          </div>
          <Toaster position="top-center" reverseOrder={false} />
        </QueryProvider>
      </body>
    </html>
  );
}

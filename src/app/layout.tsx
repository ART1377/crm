// src/app/layout.tsx
import type { Metadata } from "next"
import "../styles/globals.css"
import { Toaster } from "react-hot-toast"
import { Navbar } from "@/components/layout/navbar"
import { QueryProvider } from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "CRM مدیریت سرنخ‌ها",
  description: "سیستم مدیریت ارتباط با مشتریان برای فروش تلفنی",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-screen overflow-hidden">
      <body className="h-screen overflow-hidden bg-background">
        <QueryProvider>
          <div className="flex h-screen max-h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
        </QueryProvider>
      </body>
    </html>
  )
}
// src/app/error.tsx

'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { ROUTES } from '@/routes/routes';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // لاگ کردن خطا برای دیباگ
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-2">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {/* آیکون */}
          <div className="bg-destructive/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-10 w-10" />
          </div>

          {/* عنوان */}
          <h1 className="mb-2 text-2xl font-bold tracking-tight">مشکلی پیش آمد!</h1>

          {/* توضیحات */}
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            متأسفانه در پردازش درخواست شما خطایی رخ داده است. لطفاً دوباره تلاش کنید یا به صفحه اصلی
            بازگردید.
          </p>

          {/* نمایش پیام خطا (فقط در حالت development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="bg-muted/50 mb-6 w-full rounded-lg border p-3 text-left">
              <p className="text-muted-foreground mb-1 text-[10px] font-medium">جزئیات خطا:</p>
              <p className="text-destructive font-mono text-xs break-all" dir="ltr">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-muted-foreground mt-2 text-[10px]" dir="ltr">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button onClick={reset} className="w-full gap-2 sm:flex-1" size="lg">
              <RefreshCw className="h-4 w-4" />
              تلاش مجدد
            </Button>

            <Link href={ROUTES.home} className="w-full sm:flex-1">
              <Button variant="outline" className="w-full gap-2" size="lg">
                <Home className="h-4 w-4" />
                صفحه اصلی
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

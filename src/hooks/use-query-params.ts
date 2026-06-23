"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParams<T extends Record<string, string>>(defaults: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value) result[key as keyof T] = value as T[keyof T];
    }
    return result;
  }, [searchParams, defaults]);

  const setParams = useCallback(
    (updates: Partial<T>) => {
      const sp = new URLSearchParams();
      const merged = { ...params, ...updates };

      for (const [key, value] of Object.entries(merged)) {
        const defaultValue = (defaults as Record<string, string>)[key];
        if (value && value !== defaultValue) {
          sp.set(key, value);
        }
      }
      const query = sp.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, defaults, pathname, router]
  );

  const resetParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { params, setParams, resetParams };
}

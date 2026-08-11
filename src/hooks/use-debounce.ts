'use client';

import { SEARCH_DEBOUNCE_DELAY } from '@/constants/constants';
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = SEARCH_DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

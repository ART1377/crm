// src/hooks/use-copy.ts

'use client';

import { toEnglishDigits } from '@/lib/sanitize';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = (text: string, message = 'کپی شد') => {
    navigator.clipboard.writeText(toEnglishDigits(text));
    setCopied(true);
    toast.success(message);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copy, copied };
}

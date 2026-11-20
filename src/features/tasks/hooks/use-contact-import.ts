// src/features/tasks/hooks/use-contact-import.ts

'use client';

import { useRef, useState } from 'react';

import toast from 'react-hot-toast';

import { useBulkCheckContacts } from '@/features/leads/hooks/use-leads';
import type { BulkCheckContactsResult } from '@/features/leads/types/leads-types';

import { extractPhonesFromText, parseVCardPhones } from '@/lib/phone-utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type ImportStage = 'idle' | 'parsed' | 'loading' | 'done';

export function useContactImport() {
  const [stage, setStage] = useState<ImportStage>('idle');
  const [phones, setPhones] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<BulkCheckContactsResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkCheck = useBulkCheckContacts();

  const reset = () => {
    setStage('idle');
    setPhones([]);
    setFileName('');
    setResult(null);
    setDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم فایل بیشتر از ۱۰ مگابایت است');
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();

      // اول vCard، بعد fallback به متن آزاد
      let extracted = parseVCardPhones(text);
      if (extracted.length === 0) {
        extracted = extractPhonesFromText(text);
      }

      if (extracted.length === 0) {
        toast.error('هیچ شماره‌ای در فایل پیدا نشد');
        setStage('idle');
        return;
      }

      setPhones(extracted);
      setStage('parsed');
      toast.success(`${extracted.length} شماره از فایل استخراج شد`);
    } catch {
      toast.error('خطا در خواندن فایل');
      setStage('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleApply = () => {
    if (phones.length === 0) return;
    setStage('loading');

    bulkCheck.mutate(
      { phones, apply: true },
      {
        onSuccess: (data) => {
          setResult(data);
          setStage('done');
        },
        onError: () => {
          setStage('parsed');
        },
      }
    );
  };

  return {
    // state
    stage,
    phones,
    fileName,
    result,
    dragging,
    fileInputRef,
    // actions
    reset,
    openFilePicker,
    handleFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleApply,
    isApplying: bulkCheck.isPending,
  };
}

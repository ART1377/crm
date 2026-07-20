// src/features/settings/hooks/use-deduplicate.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { LEADS_QUERY_KEY } from '@/lib/query-keys';
import { deduplicateService } from '../api/deduplicate.api';

export function useDeduplicate() {
  const [duplicates, setDuplicates] = useState<
    Awaited<ReturnType<typeof deduplicateService.scan>>['duplicates']
  >([]);
  const [ignored, setIgnored] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: () => deduplicateService.scan(),
    onSuccess: (data) => {
      setDuplicates(data.duplicates || []);
      setIgnored(new Set());
      toast.success(`${data.duplicates.length} مورد مشکوک پیدا شد`);
    },
    onError: () => {
      toast.error('خطا در بررسی');
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ lead1Id, lead2Id }: { lead1Id: string; lead2Id: string }) =>
      deduplicateService.merge(lead1Id, lead2Id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success('ادغام شد');
      setDuplicates((prev) =>
        prev.filter((d) => d.lead1.id !== variables.lead1Id && d.lead2.id !== variables.lead2Id)
      );
    },
    onError: () => {
      toast.error('خطا در ادغام');
    },
  });

  const handleScan = () => scanMutation.mutate();
  const handleMerge = (lead1Id: string, lead2Id: string) =>
    mergeMutation.mutate({ lead1Id, lead2Id });
  const handleIgnore = (lead1Id: string, lead2Id: string) => {
    setIgnored((prev) => new Set([...prev, `${lead1Id}-${lead2Id}`]));
  };

  return {
    duplicates,
    ignored,
    loading: scanMutation.isPending,
    merging: mergeMutation.isPending ? mergeMutation.variables : null,
    handleScan,
    handleMerge,
    handleIgnore,
  };
}

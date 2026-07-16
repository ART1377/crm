// src/features/leads/components/import/hooks/use-import.ts

'use client';

import { LEADS_QUERY_KEY } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { importService } from '../services/import.service';

export function useBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      leads: Array<{
        businessName: string;
        phoneNumber: string;
        address?: string;
        industry: string;
        source: string;
        category?: string;
        website?: string;
        rating?: number;
      }>
    ) => importService.bulkImport(leads),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success(`${data.imported} سرنخ وارد شد`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

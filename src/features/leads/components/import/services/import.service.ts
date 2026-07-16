// src/features/leads/components/import/services/import.service.ts

import apiClient from '@/config/axios';

interface ImportLead {
  businessName: string;
  phoneNumber: string;
  address?: string;
  industry: string;
  source: string;
  category?: string;
  website?: string;
  rating?: number;
}

export const importService = {
  async bulkImport(leads: ImportLead[]) {
    return apiClient.post('/leads/bulk-import', { leads }) as Promise<{
      imported: number;
      skipped: number;
    }>;
  },
};

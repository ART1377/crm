// src/features/settings/api/deduplicate.api.ts

import apiClient from '@/config/axios';

interface DuplicateLead {
  id: string;
  businessName: string;
  phoneNumber: string;
  industry: string;
  status: string;
}

interface DuplicatePair {
  lead1: DuplicateLead;
  lead2: DuplicateLead;
  similarity: number;
  matchType: 'phone' | 'name' | 'both';
}

export const deduplicateService = {
  async scan() {
    return apiClient.get('/leads/deduplicate') as Promise<{
      duplicates: DuplicatePair[];
    }>;
  },

  async merge(lead1Id: string, lead2Id: string) {
    return apiClient.post('/leads/merge', { lead1Id, lead2Id }) as Promise<{
      success: boolean;
      mergedInto: string;
    }>;
  },
};

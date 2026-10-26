// src/features/leads/api/staged-leads.api.ts

import apiClient from '@/config/axios';

import type { StagedLead, StagedLeadsResponse } from '../components/staged/types';

interface SaveToStagingPayload {
  businessName: string;
  phoneNumber: string;
  industry: string;
  source: string;
  category?: string;
  address?: string;
  website?: string;
  rating?: number | null;
  notes?: string;
  matchedKeyword?: string;
  searchedIndustry?: string;
}

export const stagedLeadsService = {
  async getAll(params?: {
    status?: string;
    search?: string;
    source?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.source) query.append('source', params.source);
    if (params?.industry) query.append('industry', params.industry);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const url = `/leads/staged${query.toString() ? '?' + query.toString() : ''}`;
    return apiClient.get(url) as Promise<StagedLeadsResponse>;
  },

  async saveOne(lead: SaveToStagingPayload) {
    return apiClient.post('/leads/staged', { leads: [lead] }) as Promise<{
      added: number;
      skipped: number;
    }>;
  },

  async saveBulk(leads: SaveToStagingPayload[]) {
    return apiClient.post('/leads/staged', { leads }) as Promise<{
      added: number;
      skipped: number;
    }>;
  },

  async importOne(id: string) {
    return apiClient.post('/leads/staged/import', { ids: [id] }) as Promise<{
      imported: number;
      skipped: number;
    }>;
  },

  async importBulk(ids: string[]) {
    return apiClient.post('/leads/staged/import', { ids }) as Promise<{
      imported: number;
      skipped: number;
    }>;
  },

  async delete(id: string) {
    return apiClient.delete(`/leads/staged/${id}`) as Promise<void>;
  },

  async deleteBulk(ids: string[]) {
    return apiClient.delete('/leads/staged/bulk-delete', { data: { ids } }) as Promise<{
      deletedCount: number;
    }>;
  },

  async update(id: string, data: Partial<StagedLead>) {
    return apiClient.patch(`/leads/staged/${id}`, data) as Promise<StagedLead>;
  },
};

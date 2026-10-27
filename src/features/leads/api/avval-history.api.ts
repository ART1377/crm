// src/features/leads/api/avval-history.api.ts

import apiClient from '@/config/axios';

export interface AvvalSearchHistoryItem {
  id: string;
  slug: string;
  industry: string;
  count: number;
  pages: number;
  searchCount: number;
  lastSearchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const avvalHistoryService = {
  async getAll() {
    return apiClient.get('/avval/history') as Promise<{ history: AvvalSearchHistoryItem[] }>;
  },

  async save(data: { slug: string; industry: string; count: number; pages: number }) {
    return apiClient.post('/avval/history', data) as Promise<AvvalSearchHistoryItem>;
  },

  async deleteOne(id: string) {
    return apiClient.delete(`/avval/history?id=${id}`) as Promise<void>;
  },

  async deleteAll() {
    return apiClient.delete('/avval/history?all=true') as Promise<void>;
  },
};

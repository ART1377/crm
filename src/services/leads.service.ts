// src/services/leads.service.ts
import apiClient from "@/config/axios";
import type { CreateLeadData, Lead, LeadFilters, Task, UpdateLeadData } from "@/types";

import { LEADS_PAGE_SIZE } from "@/lib/constants";

const LEADS_ENDPOINT = "/leads";

export const leadsService = {
  async getAll(
    filters?: LeadFilters & {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.industry) params.append("industry", filters.industry);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);
    params.append("limit", String(filters?.limit || LEADS_PAGE_SIZE));

    const queryString = params.toString();
    const url = queryString ? `${LEADS_ENDPOINT}?${queryString}` : LEADS_ENDPOINT;

    return apiClient.get(url) as Promise<{
      leads: Lead[];
      total: number;
      page: number;
      hasMore: boolean;
    }>;
  },

  async getById(id: string) {
    return apiClient.get(`${LEADS_ENDPOINT}/${id}`) as Promise<Lead>;
  },

  async create(data: CreateLeadData) {
    return apiClient.post(LEADS_ENDPOINT, data) as Promise<Lead>;
  },

  async update(id: string, data: UpdateLeadData) {
    return apiClient.patch(`${LEADS_ENDPOINT}/${id}`, data) as Promise<Lead>;
  },

  async delete(id: string) {
    return apiClient.delete(`${LEADS_ENDPOINT}/${id}`) as Promise<void>;
  },

  async getStats() {
    return apiClient.get(`${LEADS_ENDPOINT}/stats`) as Promise<{
      total: number;
      newLeads: number;
      active: number;
      customers: number;
    }>;
  },

  async createTask(leadId: string, data: { title: string; dueDate: string }) {
    return apiClient.post(`/leads/${leadId}/tasks`, data) as Promise<Task>;
  },
};

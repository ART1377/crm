// src/services/templates.service.ts
import apiClient from "@/config/axios";

import type { MessageTemplate } from "@/types/types";

export const templatesService = {
  async getAll() {
    return apiClient.get("/templates") as Promise<MessageTemplate[]>;
  },

  async create(data: { title: string; content: string; type: string; purpose: string }) {
    return apiClient.post("/templates", data) as Promise<MessageTemplate>;
  },

  async update(id: string, data: Partial<MessageTemplate>) {
    return apiClient.patch(`/templates/${id}`, data) as Promise<MessageTemplate>;
  },

  async delete(id: string) {
    return apiClient.delete(`/templates/${id}`) as Promise<void>;
  },
};

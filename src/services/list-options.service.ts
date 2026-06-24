import apiClient from "@/config/axios";
import { ListOption } from "@/types";

export const listOptionsService = {
  async getAll(type: string) {
    return apiClient.get(`/list-options?type=${type}`) as Promise<ListOption[]>;
  },

  async create(data: { value: string; type: string }) {
    return apiClient.post("/list-options", data) as Promise<ListOption>;
  },

  async update(id: string, data: { value: string }) {
    return apiClient.patch(`/list-options/${id}`, data) as Promise<ListOption>;
  },

  async delete(id: string) {
    return apiClient.delete(`/list-options/${id}`) as Promise<void>;
  },
};

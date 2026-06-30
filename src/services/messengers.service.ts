// src/services/messengers.service.ts
import apiClient from "@/config/axios";
import type { Messenger } from "@/types";

export const messengersService = {
  async getAll() {
    return apiClient.get("/messengers") as Promise<Messenger[]>;
  },

  async create(data: { name: string; key: string; linkTemplate: string }) {
    return apiClient.post("/messengers", data) as Promise<Messenger>;
  },

  async update(id: string, data: Partial<Messenger>) {
    return apiClient.patch(`/messengers/${id}`, data) as Promise<Messenger>;
  },

  async delete(id: string) {
    return apiClient.delete(`/messengers/${id}`) as Promise<void>;
  },
};

import apiClient from "@/config/axios";

export const settingsService = {
  async getAll() {
    return apiClient.get("/settings") as Promise<Record<string, string>>;
  },

  async save(data: Record<string, string>) {
    return apiClient.put("/settings", data) as Promise<void>;
  },
};

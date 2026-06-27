// src/services/activities.service.ts
import apiClient from "@/config/axios";
import type { Activity, CreateActivityData } from "@/types";

export const activitiesService = {
  async create(leadId: string, data: CreateActivityData) {
    return apiClient.post(`/leads/${leadId}/activities`, data) as Promise<Activity>;
  },
  async deleteAll(leadId: string) {
    return apiClient.delete(`/activities/lead/${leadId}`) as Promise<void>;
  },
  async delete(activityId: string) {
    return apiClient.delete(`/activities/${activityId}`) as Promise<void>;
  },
};

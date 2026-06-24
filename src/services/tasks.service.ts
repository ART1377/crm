// src/services/tasks.service.ts
import apiClient from "@/config/axios";
import type { CreateTaskData, Task, UpdateTaskData } from "@/types";

export const tasksService = {
  async getByLeadId(leadId: string) {
    return apiClient.get(`/leads/${leadId}/tasks`) as Promise<Task[]>;
  },

  async getTodayTasks() {
    return apiClient.get("/tasks/today") as Promise<Task[]>;
  },

  async create(leadId: string, data: CreateTaskData) {
    return apiClient.post(`/leads/${leadId}/tasks`, data) as Promise<Task>;
  },

  async update(taskId: string, data: UpdateTaskData) {
    return apiClient.patch(`/tasks/${taskId}`, data) as Promise<Task>;
  },

  async delete(taskId: string) {
    return apiClient.delete(`/tasks/${taskId}`) as Promise<void>;
  },
  
  async deleteAll(leadId: string) {
    return apiClient.delete(`/tasks?leadId=${leadId}`) as Promise<void>;
  },
};

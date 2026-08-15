// src/features/tasks/api/tasks.api.ts

import apiClient from '@/config/axios';
import { CreateTaskData, Task, UpdateTaskData } from '../types/tasks-types';

export const tasksService = {
  async getByLeadId(leadId: string) {
    return apiClient.get(`/leads/${leadId}/tasks`) as Promise<Task[]>;
  },

  async getTodayTasks() {
    return apiClient.get('/tasks/today') as Promise<Task[]>;
  },

  async getAll(params?: {
    status?: string;
    dueDate?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    overdueDays?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.dueDate) query.append('dueDate', params.dueDate);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params?.search) query.append('search', params.search);
    if (params?.overdueDays) query.append('overdueDays', params.overdueDays);

    const url = `/tasks${query.toString() ? '?' + query.toString() : ''}`;
    return apiClient.get(url) as Promise<Task[]>;
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
    return apiClient.delete(`/tasks/lead/${leadId}`) as Promise<void>;
  },

  async bulkDelete(ids: string[]) {
    return apiClient.delete('/tasks/bulk-delete', { data: { ids } }) as Promise<{
      success: boolean;
      deletedCount: number;
      message: string;
    }>;
  },

  async bulkUpdate(ids: string[], data: { isCompleted: boolean }) {
    return apiClient.patch('/tasks/bulk-update', { ids, data }) as Promise<{
      success: boolean;
      updatedCount: number;
    }>;
  },
};

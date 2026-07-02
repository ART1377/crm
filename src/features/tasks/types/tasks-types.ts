export interface Task {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string | null;
  lead?: {
    businessName: string;
    phoneNumber: string;
  };
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  dueDate: string;
}

export interface UpdateTaskData {
  isCompleted?: boolean;
  title?: string;
  dueDate?: string;
}
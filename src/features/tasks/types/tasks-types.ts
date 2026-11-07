export interface Task {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string | null;
  lead?: {
    id: string;
    businessName: string;
    phoneNumber: string;
    contactPerson?: string | null;
    secondaryPhone?: string | null;
    industry?: string;
    notes?: string | null;
    contactSaved: boolean;
    channels?: string;
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

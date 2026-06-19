// src/types/index.ts

// src/types/index.ts
export type LeadStatus =
  | "NEW"
  | "CALLED"
  | "MESSAGED"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "CUSTOMER"
  | "NOT_INTERESTED"
  | "INVALID";

export type LeadSource =
  | "IRAN_SITE"
  | "NIAZ_ROOZ"
  | "KETAB_AVAL"
  | "INSTAGRAM"
  | "OTHER_DIRECTORY"
  | "DIRECT";

export interface Lead {
  id: string;
  businessName: string;
  contactPerson?: string | null;
  phoneNumber: string;
  secondaryPhone?: string | null;
  industry: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string | null;
  activities?: Activity[];
  tasks?: Task[];
  _count?: {
    activities: number;
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = "CALL" | "MESSAGE" | "NOTE" | "STATUS_CHANGE";

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  summary: string;
  detail?: string | null;
  createdAt: string;
}

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

export type MessengerType = "WHATSAPP" | "SMS" | "ETA" | "BALE" | "RUBIKA";
export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  type: string;
  purpose: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
  customers: number;
}

export interface LeadFilters {
  status?: string;
  search?: string;
  industry?: string;
}

export interface CreateLeadData {
  businessName: string;
  contactPerson?: string;
  phoneNumber: string;
  secondaryPhone?: string;
  industry: string;
  source?: string;
  notes?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: string;
}

export interface CreateActivityData {
  type: Activity["type"];
  summary: string;
  detail?: string;
}

export interface CreateTaskData {
  title: string;
  dueDate: string;
}

export interface UpdateTaskData {
  isCompleted: boolean;
}

export interface Messenger {
  id: string;
  name: string;
  key: string;
  linkTemplate: string;
  isActive: boolean;
}

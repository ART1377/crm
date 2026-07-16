import { Task } from '@/features/tasks/types/tasks-types';

export type LeadStatus =
  | 'NEW'
  | 'CALLED'
  | 'MESSAGED'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'CUSTOMER'
  | 'NOT_INTERESTED'
  | 'INVALID';

export type LeadSource =
  | 'BALAD'
  | 'IRAN_SITE'
  | 'NIAZ_ROOZ'
  | 'KETAB_AVAL'
  | 'INSTAGRAM'
  | 'OTHER_DIRECTORY'
  | 'DIRECT';

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
  _count?: { activities: number; tasks: number };
  channels?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'CALL' | 'MESSAGE' | 'NOTE' | 'STATUS_CHANGE';

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  summary: string;
  detail?: string | null;
  createdAt: string;
}

export interface LeadFilters {
  status?: string;
  search?: string;
  industry?: string;
  dateFrom?: string;
  dateTo?: string;
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
  type: Activity['type'];
  summary: string;
  detail?: string;
}

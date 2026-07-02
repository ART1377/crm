export interface Messenger {
  id: string;
  name: string;
  key: string;
  linkTemplate: string;
  isActive: boolean;
}

export interface ListOption {
  id: string;
  type: string;
  value: string;
}

export interface SenderFormValues {
  senderName: string;
  senderPhone: string;
  senderCompany: string;
}
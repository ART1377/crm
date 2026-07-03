export type MessengerType = 'WHATSAPP' | 'SMS' | 'ETA' | 'BALE' | 'RUBIKA';

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  type: string;
  purpose: string;
}

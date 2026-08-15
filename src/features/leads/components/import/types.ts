export interface BaladPlace {
  id: string;
  businessName: string;
  phoneNumber: string;
  address: string;
  category?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  isExisting?: boolean;
}

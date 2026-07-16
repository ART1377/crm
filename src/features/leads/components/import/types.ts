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

export interface BaladSearchResult {
  token: string;
  name: string;
  category?: string;
  address?: string;
}

export interface BaladApiPlace {
  id: number;
  token: string;
  name: string;

  category?: string;

  rating?: {
    score: number;
    count: number;
  };

  geometry?: {
    type: string;
    coordinates: [number, number];
  };

  fields: Array<{
    type: string;
    title?: string;
    text?: string;
    value?: string;
    icon?: string;
    open?: boolean;
    message?: string;
    fields?: any[];
  }>;

  phone_link?: string;
}

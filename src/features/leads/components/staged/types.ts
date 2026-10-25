// src/features/leads/components/staged/types.ts

export interface StagedLead {
  id: string;
  businessName: string;
  phoneNumber: string;
  industry: string;
  source: string;
  category?: string | null;
  address?: string | null;
  website?: string | null;
  rating?: number | null;
  notes?: string | null;
  matchedKeyword?: string | null;
  searchedIndustry?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  importedAt?: string | null;
}

export interface StagedLeadsResponse {
  items: StagedLead[];
  total: number;
  page: number;
  hasMore: boolean;
}

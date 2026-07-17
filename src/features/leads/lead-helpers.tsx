// src/features/leads/lead-helpers.ts

import { Badge } from '@/components/ui/badge';
import { LEAD_STATUSES } from './constants/leads-constants';

export const getStatusBadge = (status: string) => {
  const statusConfig = LEAD_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={statusConfig?.color || 'bg-gray-100'}>{statusConfig?.label || status}</Badge>
  );
};

export const getSourceLabel = (source: string) => {
  return source || '---';
};

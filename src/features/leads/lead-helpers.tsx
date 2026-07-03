import { Badge } from '@/components/ui/badge';

import { LEAD_SOURCES, LEAD_STATUSES } from './constants/leads-constants';

export const getStatusBadge = (status: string) => {
  const statusConfig = LEAD_STATUSES.find((s) => s.value === status);

  return (
    <Badge className={statusConfig?.color || 'bg-gray-100'}>{statusConfig?.label || status}</Badge>
  );
};

export const getSourceLabel = (source: string) => {
  return LEAD_SOURCES.find((s) => s.value === source)?.label || source;
};

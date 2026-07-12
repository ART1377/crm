'use client';

import { cn } from '@/lib/utils';

interface MessageChannelBadgeProps {
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export function MessageChannelBadge({
  label,
  icon,
  isSelected,
  onClick,
}: MessageChannelBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
        isSelected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

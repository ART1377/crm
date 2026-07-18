// src/features/leads/components/table/edit-lead/field.tsx

import { Label } from '@/components/ui/label';

export default function FieldWithIcon({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Icon className="text-muted-foreground h-4 w-4" />
        {label}
      </Label>
      {children}
    </div>
  );
}

import { Label } from "@/components/ui/label";

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
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        {children}
      </div>
    </div>
  );
}

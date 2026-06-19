import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-6 pb-6 mb-2 border-b",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 mb-1 rounded-full bg-primary shrink-0" />
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-prose">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
}

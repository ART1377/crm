import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative mt-8 mb-2 flex items-center justify-between gap-6 border-b pb-6 lg:mt-0",
        className
      )}
    >
      <div className="space-y-1">
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary mb-1 h-5 w-1 shrink-0 rounded-full" />
          <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground/60 max-w-prose text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}

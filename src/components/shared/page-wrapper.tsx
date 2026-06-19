import type { ReactNode } from "react";

interface PageWrapperProps {
  header?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ header, children }: PageWrapperProps) {
  return (
    <div className="flex flex-col h-full">
      {header && <div className="shrink-0 p-4 lg:p-6 pb-2">{header}</div>}
      <div className="flex-1 flex flex-col overflow-y-auto space-y-6 px-4 lg:px-6 pb-24 pt-2">
        {children}
      </div>
    </div>
  );
}

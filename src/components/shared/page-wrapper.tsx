import type { ReactNode } from 'react';

interface PageWrapperProps {
  header?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ header, children }: PageWrapperProps) {
  return (
    <div className="flex h-full flex-col">
      {header && <div className="shrink-0 p-4 pb-2 lg:p-6">{header}</div>}
      <div className="flex flex-1 flex-col space-y-6 overflow-y-auto px-4 pt-2 pb-24 lg:px-6">
        {children}
      </div>
    </div>
  );
}

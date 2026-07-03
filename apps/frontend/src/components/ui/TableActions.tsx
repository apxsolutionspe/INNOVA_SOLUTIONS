import { ReactNode } from 'react';

export function TableActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-wrap justify-end gap-2 max-sm:justify-start">{children}</div>;
}

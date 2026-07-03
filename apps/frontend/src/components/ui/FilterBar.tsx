import { ReactNode } from 'react';
import { Card } from './Card';

export function FilterBar({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        {actions ? <div className="flex min-w-0 flex-wrap gap-2 md:justify-end">{actions}</div> : null}
      </div>
    </Card>
  );
}

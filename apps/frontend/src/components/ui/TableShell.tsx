import { PropsWithChildren } from 'react';
import { cn } from './utils';

interface TableShellProps extends PropsWithChildren {
  maxHeight?: string;
  className?: string;
}

export function TableShell({ children, maxHeight = 'clamp(360px,52vh,640px)', className }: TableShellProps) {
  return (
    <div
      className={cn(
        'table-scroll-shell overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70',
        className,
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}

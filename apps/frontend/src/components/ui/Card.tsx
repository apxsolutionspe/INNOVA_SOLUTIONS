import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from './utils';

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

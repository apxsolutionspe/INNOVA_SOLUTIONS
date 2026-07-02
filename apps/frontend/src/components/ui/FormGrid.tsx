import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from './utils';

export function FormGrid({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)} {...props}>{children}</div>;
}

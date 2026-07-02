import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from './utils';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'violet';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  info: 'bg-blue-50 text-brand-blue ring-blue-100',
  warning: 'bg-orange-50 text-orange-700 ring-orange-100',
  danger: 'bg-red-50 text-red-700 ring-red-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  violet: 'bg-violet-50 text-brand-violet ring-violet-100',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'neutral', className, children, ...props }: PropsWithChildren<BadgeProps>) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from './utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue text-white hover:bg-blue-700 border-brand-blue',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-transparent',
  success: 'bg-brand-success text-white hover:bg-emerald-700 border-brand-success',
  warning: 'bg-brand-warning text-white hover:bg-orange-600 border-brand-warning',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-xs sm:min-h-9',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm sm:min-h-11',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

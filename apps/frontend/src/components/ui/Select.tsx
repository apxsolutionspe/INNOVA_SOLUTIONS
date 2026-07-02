import { SelectHTMLAttributes } from 'react';
import { cn } from './utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Select({ label, error, className, containerClassName, children, ...props }: SelectProps) {
  return (
    <label className={cn('block', containerClassName)}>
      {label ? <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span> : null}
      <select
        className={cn(
          'h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100',
          error && 'border-red-200 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

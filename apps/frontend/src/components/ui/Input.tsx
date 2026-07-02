import { InputHTMLAttributes } from 'react';
import { cn } from './utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, className, containerClassName, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className={cn('block', containerClassName)}>
      {label ? <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100',
          error && 'border-red-200 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

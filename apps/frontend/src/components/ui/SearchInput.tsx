import { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cn } from './utils';

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        className={cn('h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100', className)}
        {...props}
      />
    </label>
  );
}

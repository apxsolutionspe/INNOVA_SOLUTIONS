import { type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function AuthInput({ label, icon, error, className = '', ...props }: AuthInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-black text-orange-50/90">{label}</span>
      <div
        className={`login-input-shell ${
          error ? 'login-input-shell-error' : ''
        }`}
      >
        <span className="text-orange-100/75">{icon}</span>
        <input {...props} className={`h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-300/75 disabled:cursor-not-allowed disabled:opacity-70 ${className}`} />
      </div>
      {error ? <p className="mt-2 text-xs font-bold text-orange-100">{error}</p> : null}
    </label>
  );
}

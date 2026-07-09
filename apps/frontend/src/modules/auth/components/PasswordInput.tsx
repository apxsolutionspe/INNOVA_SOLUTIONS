import { type ChangeEvent, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({ value, error, disabled, onChange }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-[15px] font-black text-orange-50/95">Contraseña</span>
      <div
        className={`login-input-shell ${
          error ? 'login-input-shell-error' : ''
        }`}
      >
        <Lock size={19} className="text-orange-100/75" />
        <input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-[15px] placeholder:text-slate-300/75 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-orange-100/80 transition hover:bg-orange-200/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60"
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm font-bold text-orange-100">{error}</p> : null}
    </label>
  );
}


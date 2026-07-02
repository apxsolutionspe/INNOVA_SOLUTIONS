import { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';

import { AuthInput } from './AuthInput';
import { PasswordInput } from './PasswordInput';

interface LoginCardProps {
  email: string;
  password: string;
  fieldErrors: {
    email?: string;
    password?: string;
  };
  error: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginCard({
  email,
  password,
  fieldErrors,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginCardProps) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      onSubmit={onSubmit}
      className="login-card relative overflow-hidden p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative">
        <div className="text-center">
          <h1 className="login-title">Sistema Integral de Gestion</h1>
        </div>

        <div className="mt-8 space-y-4">
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            icon={<Mail size={19} />}
            error={fieldErrors.email}
            placeholder="usuario@innovasolutions.com"
            autoComplete="email"
            disabled={isLoading}
          />
          <PasswordInput
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            error={fieldErrors.password}
            disabled={isLoading}
          />
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-orange-300/28 bg-red-950/24 px-4 py-3 text-sm font-bold leading-6 text-orange-50 shadow-inner shadow-red-950/20">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="login-submit-button mt-6"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
          {isLoading ? 'Validando acceso...' : 'Ingresar al sistema'}
        </button>

        <p className="mt-4 text-center text-[11px] font-semibold text-slate-300/80">
          Conexion segura.
        </p>
      </div>
    </motion.form>
  );
}

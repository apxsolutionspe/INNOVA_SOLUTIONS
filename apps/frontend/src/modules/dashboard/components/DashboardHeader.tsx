import { BarChart3, Brain, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../../store/auth.store';

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ isLoading, onRefresh }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const currentDate = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-blue-50 via-cyan-50 to-transparent lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">{currentDate}</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Resumen general del negocio en tiempo real.
              {user?.fullName ? <span className="font-semibold text-slate-800"> Bienvenido, {user.fullName}.</span> : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <Link to="/reports" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-blue px-3 text-sm font-bold text-white transition hover:bg-blue-700">
              <BarChart3 size={17} />
              Ver reportes
            </Link>
            <Link to="/ai-analytics" className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800">
              <Brain size={17} />
              IA Analytics
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

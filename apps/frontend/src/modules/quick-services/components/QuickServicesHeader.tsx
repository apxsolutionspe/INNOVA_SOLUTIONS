import { Link } from 'react-router-dom';
import { History, RefreshCw, Settings, Sparkles, Wallet } from 'lucide-react';

import { CashSession } from '../../cash/types/cash.types';
import { QuickServicesTab } from '../types/quick-service-ui.types';

interface QuickServicesHeaderProps {
  cashSession: CashSession | null;
  isAdmin: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onTabChange: (tab: QuickServicesTab) => void;
}

export function QuickServicesHeader({ cashSession, isAdmin, isLoading, onRefresh, onTabChange }: QuickServicesHeaderProps) {
  const isOpen = cashSession?.status === 'OPEN';

  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-96 bg-gradient-to-l from-violet-50 via-cyan-50 to-transparent lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black uppercase text-brand-violet">
              <Sparkles size={14} />
              Caja rápida
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">Servicios Rápidos</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Operaciones rápidas de impresiones, copias, trámites y servicios varios.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className={`rounded-lg border px-4 py-3 shadow-sm ${
                isOpen ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-orange-200 bg-orange-50 text-orange-800'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-black">
                <Wallet size={18} />
                {isOpen ? 'Caja abierta' : 'Caja cerrada'}
              </div>
              <p className="mt-1 text-xs font-semibold">{isOpen ? cashSession.code : 'Abre caja para operar'}</p>
            </div>

            {!isOpen ? (
              <Link
                to="/cash"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-warning px-4 text-sm font-black text-white shadow-sm hover:bg-orange-600"
              >
                Abrir caja
              </Link>
            ) : null}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-cyan hover:text-brand-blue disabled:opacity-60"
            >
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={17} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => onTabChange('history')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
            >
              <History size={17} />
              Historial
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-violet px-4 text-sm font-bold text-white shadow-sm hover:bg-violet-700"
              >
                <Settings size={17} />
                Administrar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}


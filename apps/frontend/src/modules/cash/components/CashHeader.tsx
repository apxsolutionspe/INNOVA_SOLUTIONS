import { Banknote, LockKeyhole, RefreshCw, UnlockKeyhole } from 'lucide-react';

import { CashSession } from '../types/cash.types';
import { CashStatusBadge } from './CashStatusBadge';

interface CashHeaderProps {
  session: CashSession | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export function CashHeader({ session, isLoading, onRefresh, onOpen, onClose }: CashHeaderProps) {
  const isOpen = session?.status === 'OPEN';

  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-96 bg-gradient-to-l from-emerald-50 via-cyan-50 to-transparent lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">
              <Banknote size={14} />
              Control financiero
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">Caja</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Control de apertura, movimientos, métodos de pago y cierre diario.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className={`rounded-2xl border px-4 py-3 shadow-sm ${isOpen ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-xs font-black uppercase text-slate-500">Estado actual</p>
              <div className="mt-2 flex items-center gap-2">
                <CashStatusBadge status={session?.status ?? 'CLOSED'} />
                {session?.code ? <span className="text-sm font-black text-slate-800">{session.code}</span> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-cyan hover:text-brand-blue disabled:opacity-60"
            >
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={17} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={isOpen ? onClose : onOpen}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-white shadow-sm transition ${
                isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue hover:bg-blue-700'
              }`}
            >
              {isOpen ? <LockKeyhole size={17} /> : <UnlockKeyhole size={17} />}
              {isOpen ? 'Cerrar caja' : 'Abrir caja'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

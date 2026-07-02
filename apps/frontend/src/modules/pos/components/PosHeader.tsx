import { Link } from 'react-router-dom';
import { RefreshCw, ShoppingCart, Wallet } from 'lucide-react';

import { CashSession } from '../../cash/types/cash.types';

interface PosHeaderProps {
  cashSession: CashSession | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PosHeader({ cashSession, isLoading, onRefresh }: PosHeaderProps) {
  const isOpen = cashSession?.status === 'OPEN';
  const currentDate = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());

  return (
    <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-80 bg-gradient-to-l from-cyan-50 via-blue-50 to-transparent lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-brand-blue">
              <ShoppingCart size={14} />
              Punto de venta
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">POS</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Venta rapida de productos del inventario con caja, stock y comprobante conectados.
            </p>
            <p className="mt-2 text-xs font-semibold capitalize text-slate-500">{currentDate}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className={`rounded-lg border px-4 py-3 shadow-sm ${
                isOpen
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-orange-200 bg-orange-50 text-orange-800'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-black">
                <Wallet size={18} />
                {isOpen ? 'Caja abierta' : 'Caja cerrada'}
              </div>
              <p className="mt-1 text-xs font-semibold">
                {isOpen ? `${cashSession.code} - S/ ${cashSession.openingAmount.toFixed(2)} inicial` : 'Abre caja para vender'}
              </p>
            </div>

            {!isOpen ? (
              <Link
                to="/cash"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-warning px-4 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
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
          </div>
        </div>
      </div>
    </header>
  );
}

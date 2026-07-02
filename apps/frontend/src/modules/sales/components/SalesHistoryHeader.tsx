import { BarChart3, RefreshCw, ShoppingBag, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui';

interface SalesHistoryHeaderProps {
  totalSales: number;
  totalAmount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function SalesHistoryHeader({ totalSales, totalAmount, isLoading, onRefresh }: SalesHistoryHeaderProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
            <ShoppingBag size={14} />
            Ventas registradas
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Historial de ventas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consulta comprobantes, pagos, anulaciones y ventas confirmadas desde el POS.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Link to="/reports">
            <Button type="button">
              <BarChart3 size={16} />
              Reportes
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid border-t border-slate-100 bg-slate-50/70 sm:grid-cols-2">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <WalletCards size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Total mostrado</p>
            <p className="text-xl font-black text-slate-950">S/ {totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Operaciones</p>
            <p className="text-xl font-black text-slate-950">{totalSales}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

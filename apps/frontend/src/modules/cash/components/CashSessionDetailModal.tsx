import { ReactNode } from 'react';
import { X } from 'lucide-react';

import { CashSession } from '../types/cash.types';
import { formatMoney } from '../utils/cash-calculations';
import { CashMovementsTable } from './CashMovementsTable';
import { CashStatusBadge } from './CashStatusBadge';

export function CashSessionDetailModal({ session, onClose }: { session: CashSession; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/50 px-0 backdrop-blur-sm sm:place-items-center sm:px-4">
      <button type="button" aria-label="Cerrar detalle" className="absolute inset-0" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{session.code}</h2>
            <p className="mt-1 text-sm text-slate-500">Detalle historico de apertura, cierre y movimientos.</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Estado" value={<CashStatusBadge status={session.status} />} />
            <Metric label="Ventas" value={formatMoney(session.totalSales)} />
            <Metric label="Gastos" value={formatMoney(session.totalExpenses)} />
            <Metric label="Efectivo esperado" value={formatMoney(session.expectedCashAmount)} />
            <Metric label="Diferencia" value={formatMoney(session.difference)} />
          </div>
          <CashMovementsTable movements={session.movements ?? []} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <div className="mt-2 text-base font-black text-slate-950">{value}</div>
    </div>
  );
}

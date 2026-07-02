import { CashSessionStatus } from '../types/cash.types';

export function CashStatusBadge({ status }: { status: CashSessionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      {status === 'OPEN' ? 'Caja abierta' : 'Caja cerrada'}
    </span>
  );
}

import { FormEvent, useMemo, useState } from 'react';
import { Loader2, LockKeyhole, X } from 'lucide-react';

import { cashService } from '../services/cash.service';
import { CashSession, CashSummary } from '../types/cash.types';
import { formatMoney } from '../utils/cash-calculations';

export function CloseCashModal({
  session,
  summary,
  onClose,
  onDone,
}: {
  session: CashSession;
  summary: CashSummary;
  onClose: () => void;
  onDone: () => void;
}) {
  const [realCashAmount, setRealCashAmount] = useState(String(session.expectedCashAmount));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const difference = useMemo(() => Number(realCashAmount || 0) - session.expectedCashAmount, [realCashAmount, session.expectedCashAmount]);
  const differenceLabel = difference === 0 ? 'Correcto' : difference > 0 ? 'Sobrante' : 'Faltante';
  const differenceTone = difference === 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : difference > 0 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-red-700 bg-red-50 border-red-200';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const amount = Number(realCashAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Ingresa el efectivo contado correctamente.');
      return;
    }
    setIsSaving(true);
    try {
      await cashService.close({ realCashAmount: amount, notes: notes.trim() || undefined });
      onDone();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo cerrar caja.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/50 px-0 py-0 backdrop-blur-sm sm:place-items-center sm:px-4 sm:py-6">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0" onClick={onClose} />
      <form onSubmit={submit} className="relative flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
                <LockKeyhole size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-black">Cierre de caja</h2>
              <p className="mt-1 text-sm font-semibold text-red-50">Arqueo y confirmacion del efectivo contado.</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-white/12 transition hover:bg-white/20">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Monto inicial" value={formatMoney(session.openingAmount)} />
            <Metric label="Efectivo esperado" value={formatMoney(session.expectedCashAmount)} />
            <Metric label="Yape" value={formatMoney(summary.totalYapeToday)} />
            <Metric label="Plin" value={formatMoney(summary.totalPlinToday)} />
            <Metric label="Transferencia" value={formatMoney(summary.totalTransferToday)} />
            <Metric label="Gastos" value={formatMoney(summary.expensesToday)} />
            <Metric label="Neto esperado" value={formatMoney(summary.netCashToday)} />
            <Metric label="Ventas" value={formatMoney(session.totalSales)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
            <label className="block">
              <span className="text-sm font-black text-slate-950">Efectivo contado</span>
              <input type="number" min="0" step="0.01" value={realCashAmount} onChange={(event) => setRealCashAmount(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
            </label>
            <div className={`rounded-2xl border p-4 ${differenceTone}`}>
              <p className="text-xs font-black uppercase">{differenceLabel}</p>
              <p className="mt-1 text-2xl font-black">S/ {difference.toFixed(2)}</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-black text-slate-950">Observaciones de cierre</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Detalle del arqueo, sobrante o faltante" />
          </label>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black text-white hover:bg-red-700 disabled:bg-slate-300">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
              {isSaving ? 'Cerrando...' : 'Confirmar cierre'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

import { CheckCircle2, Loader2, ReceiptText } from 'lucide-react';

import { SalePreviewTotals } from '../types/pos.types';

interface SaleSummaryProps {
  totals: SalePreviewTotals;
  isSaving: boolean;
  disabledReason?: string;
  cartCount: number;
  onConfirm: () => void;
}

export function SaleSummary({ totals, isSaving, disabledReason, cartCount, onConfirm }: SaleSummaryProps) {
  const isDisabled = isSaving || Boolean(disabledReason);

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-emerald-500 via-brand-success to-cyan-500 p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-emerald-50">Total a cobrar</p>
            <p className="mt-1 text-4xl font-black">S/ {totals.total.toFixed(2)}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/20">
            <ReceiptText size={24} />
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-emerald-50">
          {cartCount} producto{cartCount === 1 ? '' : 's'} en la venta
        </p>
      </div>

      <div className="p-4">
      <div className="space-y-2 text-sm text-slate-600">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <strong>S/ {totals.subtotal.toFixed(2)}</strong>
        </p>
        <p className="flex justify-between">
          <span>Descuento</span>
          <strong>S/ {totals.discountTotal.toFixed(2)}</strong>
        </p>
        <p className="flex justify-between">
          <span className="inline-flex items-center gap-2">
            IGV
            {!totals.applyIgv ? (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700">
                Exonerado
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-500">
                {(totals.igvRate * 100).toFixed(2)}%
              </span>
            )}
          </span>
          <strong>S/ {totals.taxTotal.toFixed(2)}</strong>
        </p>
        <p className="flex justify-between">
          <span>Pagado</span>
          <strong>S/ {totals.paid.toFixed(2)}</strong>
        </p>
        <p className="flex justify-between">
          <span>{totals.pending > 0 ? 'Falta cobrar' : 'Vuelto'}</span>
          <strong className={totals.pending > 0 ? 'text-orange-700' : 'text-emerald-700'}>
            S/ {(totals.pending > 0 ? totals.pending : totals.change).toFixed(2)}
          </strong>
        </p>
      </div>

      {disabledReason ? (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold leading-5 text-orange-800">
          {disabledReason}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onConfirm}
        disabled={isDisabled}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-blue text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
        {isSaving ? 'Registrando venta...' : 'Confirmar venta'}
      </button>
      </div>
    </div>
  );
}

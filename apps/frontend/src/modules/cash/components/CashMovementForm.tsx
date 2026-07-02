import { FormEvent, useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';

import { cashService } from '../services/cash.service';
import { CashMovementType, PaymentMethod } from '../types/cash.types';

export function CashMovementForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<CashMovementType>('INCOME');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const numericAmount = Number(amount);
    if (!concept.trim()) {
      setError('El concepto es obligatorio.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }
    setIsSaving(true);
    try {
      await cashService.createMovement({
        type,
        paymentMethod,
        concept: concept.trim(),
        amount: numericAmount,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setConcept('');
      setAmount('');
      setReference('');
      setNotes('');
      setMessage('Movimiento registrado correctamente.');
      onDone();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo registrar el movimiento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Movimiento rapido</h2>
          <p className="mt-1 text-sm text-slate-500">Registra ingresos, gastos o ajustes sin salir de caja.</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
          {isSaving ? 'Registrando...' : 'Registrar movimiento'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Tipo</span>
          <select value={type} onChange={(event) => setType(event.target.value as CashMovementType)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto / egreso</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Método</span>
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
            <option value="CASH">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="text-xs font-black uppercase text-slate-500">Concepto</span>
          <input value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="Ej. Compra de utiles, ingreso adicional" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Monto</span>
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </label>
        <label className="block lg:col-span-2">
          <span className="text-xs font-black uppercase text-slate-500">Referencia</span>
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Operacion, voucher o codigo" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </label>
        <label className="block lg:col-span-3">
          <span className="text-xs font-black uppercase text-slate-500">Observacion</span>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Detalle opcional del movimiento" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
        </label>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
      {message ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
    </form>
  );
}

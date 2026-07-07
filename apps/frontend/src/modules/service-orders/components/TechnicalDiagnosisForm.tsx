import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Save } from 'lucide-react';

import type { ServiceOrder } from '../types/service-order.types';
import { formatCurrency } from '../utils/service-order-formatters';

interface DiagnosisPayload {
  technicalDiagnosis: string;
  solutionApplied: string;
  laborCost: number;
  discount: number;
  notes?: string;
}

export function TechnicalDiagnosisForm({
  order,
  onSubmit,
}: {
  order: ServiceOrder;
  onSubmit: (payload: DiagnosisPayload) => Promise<void>;
}) {
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(order.technicalDiagnosis ?? '');
  const [solutionApplied, setSolutionApplied] = useState(order.solutionApplied ?? '');
  const [laborCost, setLaborCost] = useState(order.laborCost ? String(order.laborCost) : '');
  const [discount, setDiscount] = useState(order.discount ? String(order.discount) : '');
  const [notes, setNotes] = useState(order.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setTechnicalDiagnosis(order.technicalDiagnosis ?? '');
    setSolutionApplied(order.solutionApplied ?? '');
    setLaborCost(order.laborCost ? String(order.laborCost) : '');
    setDiscount(order.discount ? String(order.discount) : '');
    setNotes(order.notes ?? '');
  }, [order.id, order.technicalDiagnosis, order.solutionApplied, order.laborCost, order.discount, order.notes]);

  const laborAmount = Math.max(Number(laborCost || 0), 0);
  const discountAmount = Math.max(Number(discount || 0), 0);
  const projectedTotal = useMemo(
    () => Math.max(laborAmount + Number(order.partsCost ?? 0) - discountAmount, 0),
    [laborAmount, discountAmount, order.partsCost],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (Number.isNaN(laborAmount) || Number.isNaN(discountAmount)) {
      setError('Verifica los montos ingresados.');
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        technicalDiagnosis: technicalDiagnosis.trim(),
        solutionApplied: solutionApplied.trim(),
        laborCost: laborAmount,
        discount: discountAmount,
        notes: notes.trim() || undefined,
      });
      setMessage('Diagnóstico y costos actualizados correctamente.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el diagnóstico.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-brand-violet">
            <ClipboardCheck size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">Diagnóstico y costos</h2>
            <p className="text-sm font-semibold text-slate-500">Actualiza la evaluación técnica, solución aplicada y montos del servicio.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
          <p className="text-xs font-black uppercase text-emerald-700">Total estimado</p>
          <p className="text-2xl font-black text-emerald-700">{formatCurrency(projectedTotal)}</p>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

      <div className="mt-5 grid gap-4">
        <label>
          <span className="text-xs font-black uppercase text-slate-400">Diagnóstico técnico</span>
          <textarea
            value={technicalDiagnosis}
            onChange={(event) => setTechnicalDiagnosis(event.target.value)}
            placeholder="Describe la causa probable, pruebas realizadas y hallazgos técnicos."
            className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-violet focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <label>
          <span className="text-xs font-black uppercase text-slate-400">Solución aplicada</span>
          <textarea
            value={solutionApplied}
            onChange={(event) => setSolutionApplied(event.target.value)}
            placeholder="Indica la reparación, configuración, limpieza o servicio realizado."
            className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-violet focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Mano de obra</span>
            <div className="mt-1 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-violet focus-within:ring-4 focus-within:ring-violet-100">
              <span className="grid w-12 place-items-center bg-slate-50 text-sm font-black text-slate-500">S/</span>
              <input type="number" min="0" step="0.01" value={laborCost} onChange={(event) => setLaborCost(event.target.value)} className="w-full px-3 text-sm outline-none" placeholder="0.00" />
            </div>
          </label>
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Descuento</span>
            <div className="mt-1 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-violet focus-within:ring-4 focus-within:ring-violet-100">
              <span className="grid w-12 place-items-center bg-slate-50 text-sm font-black text-slate-500">S/</span>
              <input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className="w-full px-3 text-sm outline-none" placeholder="0.00" />
            </div>
          </label>
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Repuestos actuales</span>
            <div className="mt-1 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700">
              {formatCurrency(order.partsCost)}
            </div>
          </label>
        </div>
        <label>
          <span className="text-xs font-black uppercase text-slate-400">Observaciones internas</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notas internas del técnico o indicaciones para la entrega."
            className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-violet focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <div className="flex justify-end">
          <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-violet px-5 text-sm font-black text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={16} />
            {isSaving ? 'Guardando...' : 'Guardar diagnóstico'}
          </button>
        </div>
      </div>
    </form>
  );
}

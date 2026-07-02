import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UnlockKeyhole, X } from 'lucide-react';

import { cashService } from '../services/cash.service';

export function OpenCashModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [openingAmount, setOpeningAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const amount = Number(openingAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Ingresa un monto inicial valido.');
      return;
    }
    setIsSaving(true);
    try {
      await cashService.open({ openingAmount: amount, notes: notes.trim() || undefined });
      onDone();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo abrir caja.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/50 px-0 backdrop-blur-sm sm:place-items-center sm:px-4">
      <button type="button" aria-label="Cerrar apertura de caja" className="absolute inset-0" onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={submit}
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="bg-gradient-to-br from-brand-blue via-brand-cyan to-emerald-500 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18">
                <UnlockKeyhole size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-black">Abrir caja</h2>
              <p className="mt-1 text-sm font-semibold text-cyan-50">Registra el monto inicial para iniciar operaciones.</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-white/12 transition hover:bg-white/20">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-black text-slate-950">Monto inicial</span>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              value={openingAmount}
              onChange={(event) => setOpeningAmount(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="0.00"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-950">Observacion</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Detalle opcional de apertura" />
          </label>
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-300">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
              {isSaving ? 'Abriendo...' : 'Confirmar apertura'}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

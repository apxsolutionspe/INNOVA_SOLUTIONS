import { FormEvent, useState } from 'react';
import { ArrowRightCircle, X } from 'lucide-react';

import { ServiceOrderStatus } from '../types/service-order.types';
import { serviceOrderStatusLabels } from '../utils/service-order-status';

const statuses: ServiceOrderStatus[] = ['DIAGNOSIS', 'IN_PROGRESS', 'READY'];

export function ChangeStatusModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (status: ServiceOrderStatus, comment?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<ServiceOrderStatus>('DIAGNOSIS');
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await onSubmit(status, comment.trim() || undefined);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo cambiar el estado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
              <ArrowRightCircle size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-950">Cambiar estado</h2>
              <p className="text-sm font-semibold text-slate-500">Registra el avance actual de la orden técnica.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Nuevo estado</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ServiceOrderStatus)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100">
              {statuses.map((item) => <option key={item} value={item}>{serviceOrderStatusLabels[item]}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Comentario</span>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Describe brevemente el avance o la indicación para el cliente." className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancelar</button>
          <button disabled={isSaving} className="h-10 rounded-xl bg-brand-blue px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Guardando...' : 'Guardar cambio'}
          </button>
        </div>
      </form>
    </div>
  );
}

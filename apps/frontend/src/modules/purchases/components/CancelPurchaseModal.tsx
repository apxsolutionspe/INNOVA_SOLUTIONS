import { FormEvent, useState } from 'react';

export function CancelPurchaseModal({ onSubmit, onClose }: { onSubmit: (reason: string) => Promise<void>; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit(reason);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-950">Cancelar compra</h2>
        <textarea required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo obligatorio" className="mt-4 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-500" />
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600">Volver</button>
          <button disabled={isSaving} type="submit" className="h-11 flex-1 rounded-lg bg-red-600 text-sm font-bold text-white disabled:opacity-60">{isSaving ? 'Cancelando...' : 'Cancelar'}</button>
        </div>
      </form>
    </div>
  );
}

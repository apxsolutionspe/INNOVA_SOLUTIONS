import { FormEvent, useState } from 'react';

import { Sale } from '../types/sale.types';

interface CancelSaleModalProps {
  sale: Sale;
  onSubmit: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelSaleModal({ sale, onSubmit, onClose }: CancelSaleModalProps) {
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit(reason);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">Anular {sale.code}</h2>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} required minLength={5} placeholder="Motivo obligatorio" className="mt-5 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-bold">Cancelar</button>
          <button disabled={isSaving} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white">{isSaving ? 'Anulando...' : 'Anular venta'}</button>
        </div>
      </form>
    </div>
  );
}

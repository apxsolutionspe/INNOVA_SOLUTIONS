import { FormEvent, useState } from 'react';

export function CancelQuickServiceSaleModal({ onSubmit, onClose }: { onSubmit: (reason: string) => Promise<void>; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const submit = async (event: FormEvent) => { event.preventDefault(); await onSubmit(reason); onClose(); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"><form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"><h2 className="text-xl font-black">Cancelar operación</h2><textarea value={reason} onChange={(e) => setReason(e.target.value)} required minLength={5} className="mt-4 min-h-24 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Motivo obligatorio" /><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 font-bold">Cerrar</button><button className="h-10 rounded-lg bg-red-600 px-4 font-bold text-white">Cancelar</button></div></form></div>;
}


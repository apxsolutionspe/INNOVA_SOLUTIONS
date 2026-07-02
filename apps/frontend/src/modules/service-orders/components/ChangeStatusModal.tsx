import { FormEvent, useState } from 'react';
import { ServiceOrderStatus } from '../types/service-order.types';

const statuses: ServiceOrderStatus[] = ['DIAGNOSIS', 'IN_PROGRESS', 'READY'];

export function ChangeStatusModal({ onSubmit, onClose }: { onSubmit: (status: ServiceOrderStatus, comment?: string) => Promise<void>; onClose: () => void }) {
  const [status, setStatus] = useState<ServiceOrderStatus>('DIAGNOSIS');
  const [comment, setComment] = useState('');
  const submit = async (event: FormEvent) => { event.preventDefault(); await onSubmit(status, comment); onClose(); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold">Cambiar estado</h2>
        <select value={status} onChange={(event) => setStatus(event.target.value as ServiceOrderStatus)} className="mt-4 h-10 w-full rounded-lg border px-3 text-sm">{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comentario" className="mt-3 min-h-20 w-full rounded-lg border px-3 py-2 text-sm" />
        <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-bold">Cancelar</button><button className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Guardar</button></div>
      </form>
    </div>
  );
}

import { FormEvent, useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { Button } from '../../../components/ui';

export function ChangePasswordModal({ onSubmit, onClose }: { onSubmit: (password: string) => Promise<void>; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit(password);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Seguridad</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Cambiar contraseña</h2>
            <p className="mt-1 text-sm text-slate-500">Define una clave temporal segura para el usuario.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Nueva contraseña
            <span className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-full">Cancelar</Button>
          <Button type="submit" disabled={isSaving} className="rounded-full">{isSaving ? 'Guardando...' : 'Guardar clave'}</Button>
        </div>
      </form>
    </div>
  );
}

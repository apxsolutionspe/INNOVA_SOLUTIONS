import { FormEvent, useState } from 'react';
import { Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import { Button } from '../../../components/ui';
import { getRoleLabel } from '../../../lib/rbac';
import { Role } from '../../../types/auth';
import { SystemUser, UserPayload } from '../types/user.types';

export function UserForm({ user, roles, onSubmit, onClose }: { user?: SystemUser | null; roles: Role[]; onSubmit: (payload: UserPayload) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<UserPayload>({ fullName: user?.fullName ?? '', email: user?.email ?? '', roleId: user?.roleId ?? roles[0]?.id ?? '', password: '' });
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({ ...form, password: form.password || undefined });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Administración</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{user ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <p className="mt-1 text-sm text-slate-500">Gestiona el acceso sin modificar permisos del sistema.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Nombre completo
            <span className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Ej. Ana Torres" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Correo electrónico
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@innovasolutions.com" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </span>
          </label>

          {!user ? (
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Contraseña inicial
              <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </label>
          ) : null}

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Rol
            <span className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
                {roles.map((role) => <option key={role.id} value={role.id}>{getRoleLabel(role)}</option>)}
              </select>
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-full">Cancelar</Button>
          <Button type="submit" disabled={isSaving} className="rounded-full">{isSaving ? 'Guardando...' : 'Guardar usuario'}</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { CalendarClock, CheckCircle2, Clock3, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import { getRoleInitials, getRoleLabel } from '../../lib/rbac';
import { AuthUser } from '../../types/auth';

interface UserProfilePanelProps {
  user: AuthUser | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return 'No registrado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No registrado';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function UserProfilePanel({ user, isOpen, onClose }: UserProfilePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const displayName = user?.fullName ?? 'Usuario';
  const roleName = user?.role?.name;
  const roleLabel = getRoleLabel(roleName);
  const username = useMemo(() => user?.email?.split('@')[0] ?? 'No registrado', [user?.email]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/30 p-3 backdrop-blur-sm sm:p-5">
      <div
        ref={panelRef}
        className="ml-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100dvh-2.5rem)]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-6 py-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(34,211,238,0.34),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(124,58,237,0.28),transparent_30%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-white/20 bg-white/15 text-xl font-black shadow-lg shadow-cyan-950/30 ring-1 ring-white/15">
                {getRoleInitials(roleName, displayName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Perfil de usuario</p>
                <h2 className="mt-1 truncate text-xl font-black tracking-tight">{displayName}</h2>
                <p className="mt-1 truncate text-sm font-medium text-cyan-100">{user?.email ?? 'Correo no registrado'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar perfil"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-300/30"
            >
              <X size={19} />
            </button>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/30 bg-cyan-300/15 px-3 py-1 text-xs font-black text-cyan-50">
              <ShieldCheck size={14} />
              {roleLabel}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${user?.isActive ? 'border-emerald-200/40 bg-emerald-300/15 text-emerald-50' : 'border-red-200/40 bg-red-300/15 text-red-50'}`}>
              <CheckCircle2 size={14} />
              {user?.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-5">
          <div className="grid gap-3">
            <ProfileItem icon={UserRound} label="Nombre completo" value={displayName} />
            <ProfileItem icon={Mail} label="Correo electrónico" value={user?.email ?? 'No registrado'} />
            <ProfileItem icon={ShieldCheck} label="Rol del sistema" value={roleLabel} />
            <ProfileItem icon={UserRound} label="Usuario" value={username} />
            <ProfileItem icon={CheckCircle2} label="Estado de cuenta" value={user?.isActive ? 'Activo' : 'Inactivo'} tone={user?.isActive ? 'success' : 'danger'} />
            <ProfileItem icon={Clock3} label="Último acceso" value={formatDate(user?.lastLoginAt)} />
            <ProfileItem icon={CalendarClock} label="Fecha de creación" value={formatDate(user?.createdAt)} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Este panel muestra datos de sesión disponibles. No se exponen contraseñas, tokens ni información sensible.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ProfileItemProps {
  icon: typeof UserRound;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'danger';
}

function ProfileItem({ icon: Icon, label, value, tone = 'default' }: ProfileItemProps) {
  const valueColor = tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-red-700' : 'text-slate-950';

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-1 break-words text-sm font-black ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

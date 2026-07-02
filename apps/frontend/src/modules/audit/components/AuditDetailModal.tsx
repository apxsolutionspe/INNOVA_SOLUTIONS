import { Activity, CalendarClock, FileText, ShieldCheck, UserRound, X } from 'lucide-react';
import { AuditLog } from '../types/audit.types';

export function AuditDetailModal({ item, onClose }: { item: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-950 to-blue-950 px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Detalle de auditoría</p>
            <h2 className="mt-1 text-xl font-black">{item.action.replaceAll('_', ' ')}</h2>
            <p className="mt-1 text-sm text-cyan-50/75">Registro completo del evento seleccionado.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/20" aria-label="Cerrar detalle">
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <DetailItem icon={CalendarClock} label="Fecha" value={new Date(item.createdAt).toLocaleString('es-PE')} />
          <DetailItem icon={ShieldCheck} label="Módulo" value={item.module ?? 'Sistema'} />
          <DetailItem icon={Activity} label="Acción" value={item.action} />
          <DetailItem icon={UserRound} label="Usuario" value={item.user?.fullName ?? 'Sistema'} helper={item.user?.email ?? 'Acción automática'} />
        </div>

        {item.description ? (
          <div className="px-5 pb-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Descripción</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{item.description}</p>
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <details>
            <summary className="cursor-pointer text-sm font-black text-slate-700">Ver datos técnicos</summary>
            <pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(item, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, helper }: { icon: typeof FileText; label: string; value: string; helper?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-black text-slate-950">{value}</p>
        {helper ? <p className="mt-0.5 break-words text-xs text-slate-500">{helper}</p> : null}
      </div>
    </div>
  );
}

import { Activity, AlertTriangle, CalendarClock, DatabaseZap, ShieldCheck } from 'lucide-react';
import { ErrorState } from '../../../components/ui';
import { AuditDetailModal } from '../components/AuditDetailModal';
import { AuditFilters } from '../components/AuditFilters';
import { AuditLogsTable } from '../components/AuditLogsTable';
import { useAuditLogs } from '../hooks/useAuditLogs';

export function AuditLogsPage() {
  const audit = useAuditLogs();
  const modulesCount = new Set(audit.items.map((item) => item.module).filter(Boolean)).size;
  const actionsCount = new Set(audit.items.map((item) => item.action)).size;
  const latestLog = audit.items[0]?.createdAt;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-5 py-6 text-white sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.28),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(124,58,237,0.25),transparent_32%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-100 shadow-lg shadow-slate-950/20">
                <ShieldCheck size={27} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Control administrativo</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Auditoría</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50/80">
                  Revisa eventos críticos, cambios de configuración y acciones operativas con trazabilidad segura.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-50">
              <Activity size={15} />
              {audit.items.length} eventos visibles
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 p-4 md:grid-cols-3">
          <AuditMetric icon={DatabaseZap} label="Módulos" value={modulesCount} />
          <AuditMetric icon={AlertTriangle} label="Acciones" value={actionsCount} />
          <AuditMetric icon={CalendarClock} label="Último evento" value={latestLog ? new Date(latestLog).toLocaleDateString('es-PE') : 'Sin datos'} />
        </div>
      </div>

      <AuditFilters filters={audit.filters} onChange={audit.setFilters} />

      {audit.error ? <ErrorState message={audit.error} onRetry={() => void audit.load()} /> : null}

      <AuditLogsTable items={audit.items} isLoading={audit.isLoading} onView={audit.setSelected} />

      {audit.selected ? <AuditDetailModal item={audit.selected} onClose={() => audit.setSelected(null)} /> : null}
    </section>
  );
}

function AuditMetric({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string | number }) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-lg font-black text-slate-950">{value}</p>
      </div>
    </article>
  );
}

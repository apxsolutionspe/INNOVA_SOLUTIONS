import { Activity, Clock3, Eye, FileSearch, ShieldCheck, UserRound } from 'lucide-react';
import { Button, EmptyState, LoadingState, TableShell } from '../../../components/ui';
import { cn } from '../../../components/ui/utils';
import { AuditLog } from '../types/audit.types';

interface AuditLogsTableProps {
  items: AuditLog[];
  isLoading?: boolean;
  onView: (item: AuditLog) => void;
}

const actionTones: Array<{ match: string; className: string }> = [
  { match: 'LOGIN', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { match: 'PASSWORD', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  { match: 'CREATE', className: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
  { match: 'UPDATE', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  { match: 'DELETE', className: 'border-red-200 bg-red-50 text-red-700' },
  { match: 'CANCEL', className: 'border-red-200 bg-red-50 text-red-700' },
  { match: 'EXPORT', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
];

function getActionTone(action: string) {
  return actionTones.find((tone) => action.includes(tone.match))?.className ?? 'border-slate-200 bg-slate-50 text-slate-700';
}

function formatAction(action: string) {
  return action.replaceAll('_', ' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function AuditLogsTable({ items, isLoading = false, onView }: AuditLogsTableProps) {
  if (isLoading) return <LoadingState rows={6} />;

  if (!items.length) {
    return (
      <EmptyState
        title="Sin logs para los filtros seleccionados"
        description="Ajusta los filtros para ver la trazabilidad de acciones del sistema."
        icon={FileSearch}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(380px,54vh,640px)" className="hidden rounded-none border-0 shadow-none lg:block">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Módulo</th>
              <th className="px-5 py-4">Acción</th>
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="group transition hover:bg-blue-50/35">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock3 size={16} className="text-slate-400" />
                    <span className="font-bold">{formatDate(item.createdAt)}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
                    <ShieldCheck size={13} />
                    {item.module ?? 'Sistema'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <ActionBadge action={item.action} />
                </td>
                <td className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950">{item.user?.fullName ?? 'Sistema'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.user?.email ?? 'Acción automática'}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button type="button" variant="secondary" size="sm" onClick={() => onView(item)} className="rounded-full">
                    <Eye size={15} />
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <div className="table-scroll-shell grid max-h-[70vh] gap-3 overflow-y-auto p-3 lg:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <ActionBadge action={item.action} />
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Clock3 size={14} />
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => onView(item)} className="rounded-full">
                <Eye size={14} />
              </Button>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Activity size={15} className="text-blue-600" />
                {item.module ?? 'Sistema'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <UserRound size={15} className="text-slate-400" />
                <span className="truncate">{item.user?.fullName ?? 'Sistema'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className={cn('inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide transition hover:-translate-y-0.5', getActionTone(action))}>
      <span className="truncate">{formatAction(action)}</span>
    </span>
  );
}

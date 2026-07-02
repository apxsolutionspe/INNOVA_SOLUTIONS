import { CheckCircle2, ClipboardList, PackageCheck, Wrench } from 'lucide-react';

interface ServiceOrderStatsProps {
  stats: {
    pending: number;
    inProgress: number;
    ready: number;
    deliveredToday: number;
  };
}

const cards = [
  { key: 'pending', label: 'Pendientes', description: 'Recibidas o en diagnostico', icon: ClipboardList, tone: 'bg-blue-50 text-brand-blue border-blue-100' },
  { key: 'inProgress', label: 'En proceso', description: 'Equipos en reparacion', icon: Wrench, tone: 'bg-violet-50 text-brand-violet border-violet-100' },
  { key: 'ready', label: 'Listas', description: 'Pendientes de entrega', icon: PackageCheck, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'deliveredToday', label: 'Entregadas hoy', description: 'Cerradas durante el dia', icon: CheckCircle2, tone: 'bg-slate-100 text-slate-700 border-slate-200' },
] as const;

export function ServiceOrderStats({ stats }: ServiceOrderStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{stats[card.key]}</p>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-xl border ${card.tone}`}>
                <Icon size={21} />
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{card.description}</p>
          </article>
        );
      })}
    </div>
  );
}

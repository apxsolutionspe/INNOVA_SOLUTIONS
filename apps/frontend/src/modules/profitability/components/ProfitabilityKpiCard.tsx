import { LucideIcon } from 'lucide-react';

type KpiTone = 'green' | 'orange' | 'red' | 'blue' | 'teal';

const tones: Record<KpiTone, { icon: string; accent: string }> = {
  green: { icon: 'bg-emerald-50 text-emerald-700', accent: 'bg-emerald-500' },
  orange: { icon: 'bg-orange-50 text-orange-700', accent: 'bg-orange-500' },
  red: { icon: 'bg-red-50 text-red-700', accent: 'bg-red-500' },
  blue: { icon: 'bg-blue-50 text-brand-blue', accent: 'bg-brand-blue' },
  teal: { icon: 'bg-cyan-50 text-cyan-700', accent: 'bg-cyan-500' },
};

interface ProfitabilityKpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: KpiTone;
  badge?: string;
}

export function ProfitabilityKpiCard({ title, value, description, icon: Icon, tone, badge }: ProfitabilityKpiCardProps) {
  const style = tones[tone];

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-3 truncate text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.icon}`}>
          <Icon size={21} />
        </div>
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold text-slate-500">{description}</p>
        {badge ? <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${style.icon}`}>{badge}</span> : null}
      </div>
    </article>
  );
}

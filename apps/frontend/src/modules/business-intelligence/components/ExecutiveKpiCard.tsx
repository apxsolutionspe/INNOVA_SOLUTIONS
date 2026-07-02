import { LucideIcon } from 'lucide-react';

type KpiTone = 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'slate';

const tones: Record<KpiTone, { icon: string; badge: string }> = {
  blue: { icon: 'bg-blue-50 text-brand-blue', badge: 'bg-blue-50 text-blue-700' },
  green: { icon: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
  orange: { icon: 'bg-orange-50 text-orange-600', badge: 'bg-orange-50 text-orange-700' },
  red: { icon: 'bg-red-50 text-red-600', badge: 'bg-red-50 text-red-700' },
  violet: { icon: 'bg-violet-50 text-brand-violet', badge: 'bg-violet-50 text-violet-700' },
  slate: { icon: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-600' },
};

interface ExecutiveKpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  badge?: string;
}

export function ExecutiveKpiCard({ title, value, description, icon: Icon, tone = 'blue', badge }: ExecutiveKpiCardProps) {
  const style = tones[tone];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-400">{title}</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${style.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-between gap-2">
        {description ? <p className="truncate text-xs font-semibold text-slate-500">{description}</p> : <span />}
        {badge ? <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ${style.badge}`}>{badge}</span> : null}
      </div>
    </article>
  );
}

import { LucideIcon } from 'lucide-react';

type KpiTone = 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'cyan' | 'slate';

const tones: Record<KpiTone, { icon: string; accent: string }> = {
  blue: { icon: 'bg-blue-50 text-brand-blue', accent: 'bg-brand-blue' },
  green: { icon: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500' },
  orange: { icon: 'bg-orange-50 text-orange-600', accent: 'bg-orange-500' },
  red: { icon: 'bg-red-50 text-red-600', accent: 'bg-red-500' },
  violet: { icon: 'bg-violet-50 text-brand-violet', accent: 'bg-brand-violet' },
  cyan: { icon: 'bg-cyan-50 text-cyan-600', accent: 'bg-cyan-500' },
  slate: { icon: 'bg-slate-100 text-slate-600', accent: 'bg-slate-400' },
};

interface ReportKpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: KpiTone;
}

export function ReportKpiCard({ title, value, description, icon: Icon, tone = 'blue' }: ReportKpiCardProps) {
  const style = tones[tone];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-3 truncate text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.icon}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 min-h-5 truncate text-xs font-semibold text-slate-500">{description}</p>
    </article>
  );
}

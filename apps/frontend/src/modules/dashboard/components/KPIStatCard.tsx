import { motion } from 'framer-motion';
import { KPIStat } from '../types/dashboard.types';

const toneStyles: Record<KPIStat['tone'], { icon: string; accent: string; bg: string }> = {
  blue: { icon: 'bg-blue-50 text-brand-blue', accent: 'bg-brand-blue', bg: 'from-blue-50 to-white' },
  cyan: { icon: 'bg-cyan-50 text-brand-cyan', accent: 'bg-brand-cyan', bg: 'from-cyan-50 to-white' },
  violet: { icon: 'bg-violet-50 text-brand-violet', accent: 'bg-brand-violet', bg: 'from-violet-50 to-white' },
  green: { icon: 'bg-emerald-50 text-brand-success', accent: 'bg-brand-success', bg: 'from-emerald-50 to-white' },
  orange: { icon: 'bg-orange-50 text-brand-warning', accent: 'bg-brand-warning', bg: 'from-orange-50 to-white' },
  red: { icon: 'bg-red-50 text-brand-danger', accent: 'bg-brand-danger', bg: 'from-red-50 to-white' },
  slate: { icon: 'bg-slate-100 text-slate-700', accent: 'bg-slate-700', bg: 'from-slate-50 to-white' },
};

interface KPIStatCardProps {
  metric: KPIStat;
  isLoading: boolean;
  index: number;
}

export function KPIStatCard({ metric, isLoading, index }: KPIStatCardProps) {
  const Icon = metric.icon;
  const styles = toneStyles[metric.tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.035 }}
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br ${styles.bg} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{metric.label}</p>
          <p className="mt-3 truncate text-2xl font-black text-slate-950 sm:text-3xl">{isLoading ? '...' : metric.value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{metric.description}</p>
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${styles.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.article>
  );
}

interface ModeBadgeProps {
  label: string;
  tone?: 'mock' | 'real' | 'sandbox' | 'error' | 'neutral';
}

const styles = {
  mock: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  real: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  sandbox: 'bg-violet-50 text-violet-700 ring-violet-100',
  error: 'bg-red-50 text-red-700 ring-red-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function ModeBadge({ label, tone = 'neutral' }: ModeBadgeProps) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${styles[tone]}`}>{label}</span>;
}

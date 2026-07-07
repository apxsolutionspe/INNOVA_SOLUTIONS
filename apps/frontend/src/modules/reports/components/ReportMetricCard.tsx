interface ReportMetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function ReportMetricCard({ label, value, helper }: ReportMetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-black leading-tight text-slate-950">{value}</p>
      {helper ? <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
    </div>
  );
}

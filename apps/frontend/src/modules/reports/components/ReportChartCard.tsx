import { ReactNode } from 'react';

export function ReportChartCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

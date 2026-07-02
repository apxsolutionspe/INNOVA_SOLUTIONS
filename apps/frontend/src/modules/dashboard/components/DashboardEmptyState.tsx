import { Inbox } from 'lucide-react';

export function DashboardEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-400 shadow-sm">
        <Inbox size={21} />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

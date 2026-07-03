import { MessageSquareText } from 'lucide-react';

export function AiEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <MessageSquareText size={22} />
      </div>
      <p className="mt-4 text-sm font-black text-slate-900">Haz una pregunta para comenzar</p>
      <p className="mt-1 text-sm text-slate-500">Usa datos reales para tomar mejores decisiones.</p>
    </div>
  );
}

export function AiInsightCard({ title, items, actionLabel, onAction, loading }: { title: string; items: string[]; actionLabel?: string; onAction?: () => void; loading?: boolean }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-bold text-slate-950">{title}</h2>
        {actionLabel ? <button type="button" onClick={onAction} disabled={loading} className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{loading ? 'Analizando...' : actionLabel}</button> : null}
      </div>
      <div className="mt-3 space-y-2">{items.map((item) => <p key={item} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{item}</p>)}</div>
    </article>
  );
}

export function QuickServiceLoadingState() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
          <div className="mt-8 flex items-center justify-between">
            <div className="h-8 w-24 rounded bg-slate-100" />
            <div className="h-9 w-20 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

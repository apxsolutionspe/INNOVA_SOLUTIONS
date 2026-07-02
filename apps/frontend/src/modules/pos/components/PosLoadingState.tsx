export function PosLoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="min-h-[16.5rem] animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="h-10 w-3/4 rounded bg-slate-100" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="mt-5 h-6 w-28 rounded-full bg-slate-100" />
            <div className="mt-2 h-6 w-32 rounded-full bg-slate-100" />
            <div className="mt-10 border-t border-slate-100 pt-4">
              <div className="h-7 w-24 rounded bg-slate-100" />
              <div className="mt-3 h-10 w-full rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

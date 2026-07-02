export function DashboardLoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="mt-5 h-8 w-32 rounded bg-slate-100" />
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

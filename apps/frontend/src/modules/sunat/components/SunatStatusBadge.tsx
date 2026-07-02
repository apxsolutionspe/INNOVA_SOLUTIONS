export function SunatStatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">{status}</span>;
}

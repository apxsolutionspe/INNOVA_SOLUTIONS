export function OnlineOrderStatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">{status}</span>;
}

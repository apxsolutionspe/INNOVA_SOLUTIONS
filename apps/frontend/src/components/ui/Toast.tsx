import { CheckCircle2 } from 'lucide-react';

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
      <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} /> {message}</span>
    </div>
  );
}

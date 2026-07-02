import { AlertTriangle } from 'lucide-react';

export function SystemAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
      <AlertTriangle className="mt-0.5 shrink-0" size={18} />
      <span>{message}</span>
    </div>
  );
}

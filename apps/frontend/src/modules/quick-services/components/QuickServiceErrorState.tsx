import { AlertTriangle } from 'lucide-react';

export function QuickServiceErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
      <AlertTriangle className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="font-black">No se pudo completar la operación</p>
        <p className="mt-1 leading-5">{message}</p>
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';

export function DashboardErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-bold">No se pudo cargar el dashboard</p>
        <p className="mt-1 leading-5">{message}</p>
      </div>
    </div>
  );
}

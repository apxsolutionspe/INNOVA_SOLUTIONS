import { AlertCircle } from 'lucide-react';

export function AiErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 shrink-0" size={17} />
        <span>{message || 'No se pudo generar el analisis. Intenta nuevamente.'}</span>
      </div>
    </div>
  );
}

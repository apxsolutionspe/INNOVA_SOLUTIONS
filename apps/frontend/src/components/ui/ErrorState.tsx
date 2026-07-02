import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'No se pudo completar la operacion', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
      <AlertTriangle className="mt-0.5 shrink-0" size={18} />
      <div className="min-w-0 flex-1">
        <p className="font-black">{title}</p>
        <p className="mt-1 leading-5">{message}</p>
      </div>
      {onRetry ? <Button type="button" size="sm" variant="danger" onClick={onRetry}>Reintentar</Button> : null}
    </div>
  );
}

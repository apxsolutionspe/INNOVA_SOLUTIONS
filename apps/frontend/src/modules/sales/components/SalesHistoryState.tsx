import { AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button, EmptyState, LoadingState } from '../../../components/ui';

interface SalesHistoryStateProps {
  type: 'loading' | 'error' | 'empty' | 'filtered-empty';
  message?: string;
  onRetry?: () => void;
}

export function SalesHistoryState({ type, message, onRetry }: SalesHistoryStateProps) {
  if (type === 'loading') {
    return <LoadingState rows={6} />;
  }

  if (type === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-black">No se pudo cargar el historial</p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                {message || 'Verifica la conexión con el servidor e intenta nuevamente.'}
              </p>
            </div>
          </div>
          {onRetry ? (
            <Button type="button" variant="danger" onClick={onRetry}>
              <RefreshCw size={16} />
              Reintentar
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (type === 'filtered-empty') {
    return (
      <EmptyState
        title="No se encontraron ventas"
        description="Ajusta la búsqueda o limpia los filtros para ver otras operaciones."
        icon={ShoppingCart}
      />
    );
  }

  return (
    <EmptyState
      title="Aún no hay ventas registradas"
      description="Cuando confirmes una venta desde el POS, aparecerá aquí con sus pagos, IGV y comprobante."
      icon={ShoppingCart}
      action={
        <Link to="/pos">
          <Button type="button">Ir al POS</Button>
        </Link>
      }
    />
  );
}

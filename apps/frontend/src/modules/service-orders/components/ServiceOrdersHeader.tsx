import { ClipboardPlus, RefreshCw } from 'lucide-react';

import { Button } from '../../../components/ui';

interface ServiceOrdersHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export function ServiceOrdersHeader({ isLoading, onRefresh, onCreate }: ServiceOrdersHeaderProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-brand-blue">Servicio tecnico</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Ordenes tecnicas</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Recepcion, diagnostico y entrega de equipos con seguimiento operativo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Button type="button" onClick={onCreate}>
            <ClipboardPlus size={16} />
            Nueva orden
          </Button>
        </div>
      </div>
    </header>
  );
}

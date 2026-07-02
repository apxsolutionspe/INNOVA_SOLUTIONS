import { Database, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AiIndexStatus } from '../types/ai-analytics.types';

interface AiRebuildIndexPanelProps {
  status: AiIndexStatus | null;
  rebuilding: boolean;
  onRebuild: () => void;
}

export function AiRebuildIndexPanel({ status, rebuilding, onRebuild }: AiRebuildIndexPanelProps) {
  return (
    <div className="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-brand-violet" />
            <h2 className="font-black text-slate-950">Indice RAG</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Reconstruye el indice con documentacion y contexto resumido del negocio. No indexa archivos sensibles.
          </p>
        </div>
        <Button type="button" onClick={onRebuild} disabled={rebuilding}>
          <RefreshCw size={17} /> {rebuilding ? 'Reconstruyendo...' : 'Reconstruir indice'}
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-black uppercase text-slate-400">Documentos</p>
          <p className="mt-1 text-xl font-black text-slate-950">{status?.documents ?? 0}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-black uppercase text-slate-400">Vector store</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{status?.chroma ?? 'Sin estado'}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-orange-800">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase"><ShieldAlert size={15} /> Privacidad</p>
          <p className="mt-1 text-xs font-semibold">No indexar .env, tokens ni datos personales sensibles.</p>
        </div>
      </div>
    </div>
  );
}

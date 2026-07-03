import { ChevronDown } from 'lucide-react';
import { AiAnalysisResult, AiConnectionStatus, AiInsightResponse } from '../types/ai-analytics.types';

interface AiTechnicalDetailsProps {
  result?: AiAnalysisResult | AiInsightResponse | null;
  status?: AiConnectionStatus | null;
}

export function AiTechnicalDetails({ result, status }: AiTechnicalDetailsProps) {
  const metadata = result?.metadata ?? {};
  const provider = result?.provider ?? status?.provider ?? 'RULE_BASED';
  const mode = result?.mode ?? status?.mode ?? 'RULE_BASED_FALLBACK';
  const model = (result && 'model' in result ? result.model : undefined) ?? status?.model ?? 'No configurado';

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-100">
        Detalles tecnicos
        <ChevronDown size={17} className="transition group-open:rotate-180" />
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Detail label="Proveedor" value={provider} />
        <Detail label="Modelo" value={model} />
        <Detail label="Modo" value={mode} />
        <Detail label="Cache" value={metadata.cached === true ? 'Si' : metadata.cached === false ? 'No' : 'N/D'} />
        <Detail label="Fallback" value={metadata.fallbackUsed === true ? 'Si' : metadata.fallbackUsed === false ? 'No' : 'N/D'} />
      </div>
      {typeof metadata.durationMs === 'number' ? (
        <p className="mt-3 text-xs font-semibold text-slate-500">Tiempo de respuesta: {metadata.durationMs} ms</p>
      ) : null}
    </details>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}

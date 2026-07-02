import { CheckCircle2, XCircle } from 'lucide-react';
import { IntegrationTestResult } from '../types/integration.types';

export function IntegrationTestResultModal({ result, onClose }: { result: IntegrationTestResult; onClose: () => void }) {
  const isError = result.status === 'ERROR';
  const Icon = isError ? XCircle : CheckCircle2;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Icon className={isError ? 'text-red-500' : 'text-emerald-500'} size={26} />
          <div>
            <h2 className="text-lg font-bold text-slate-950">Resultado de prueba</h2>
            <p className="text-sm text-slate-500">{result.provider} - {result.mode}</p>
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{result.message}</p>
        <button onClick={onClose} className="mt-5 h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Cerrar</button>
      </div>
    </div>
  );
}

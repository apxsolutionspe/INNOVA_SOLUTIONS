import { IntegrationItem } from '../types/integration.types';

export function IntegrationConfigModal({ integration, onClose }: { integration: IntegrationItem; onClose: () => void }) {
  const entries = Object.entries(integration.publicConfig ?? {});
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">{integration.name}</h2>
        <p className="mt-2 text-sm text-slate-500">Las credenciales privadas se configuran solo en backend mediante variables de entorno. Aqui solo se muestran valores publicos o enmascarados.</p>
        <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
          {entries.length ? entries.map(([key, value]) => <div key={key} className="flex justify-between gap-3"><span className="font-semibold text-slate-600">{key}</span><span className="truncate text-slate-500">{String(value ?? 'No configurado')}</span></div>) : <p className="text-slate-500">Sin configuración pública.</p>}
        </div>
        <button onClick={onClose} className="mt-5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white">Cerrar</button>
      </div>
    </div>
  );
}

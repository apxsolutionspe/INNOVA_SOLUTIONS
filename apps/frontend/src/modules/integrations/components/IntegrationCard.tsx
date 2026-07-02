import { Activity, Clock, ExternalLink, Settings, ShieldCheck, TestTube2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { IntegrationItem } from '../types/integration.types';

const pathMap: Record<string, string> = { SUNAT: '/sunat', WHATSAPP: '/whatsapp', CULQI: '/payments', IZIPAY: '/payments', AI: '/ai-analytics', ECOMMERCE: '/ecommerce' };

export function IntegrationCard({ integration, onConfigure, onTest }: { integration: IntegrationItem; onConfigure: () => void; onTest: () => void }) {
  const modeTone = integration.mode === 'PRODUCTION' ? 'real' : integration.mode === 'SANDBOX' ? 'sandbox' : 'mock';
  return (
    <article className="flex min-h-[20rem] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-brand-blue">
              <Activity size={18} />
            </div>
            <h2 className="truncate text-lg font-black text-slate-950">{integration.name}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{integration.description}</p>
        </div>
        <IntegrationStatusBadge status={integration.status} />
      </div>

      <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-500"><ShieldCheck size={16} /> Modo</span>
          <ModeBadge label={integration.mode} tone={modeTone} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-500"><Clock size={16} /> Ultima prueba</span>
          <span className="truncate text-xs font-bold text-slate-500">{integration.lastTestAt ? new Date(integration.lastTestAt).toLocaleString() : 'Sin pruebas'}</span>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          {integration.lastError ?? (integration.mode === 'MOCK' ? 'Modo mock activo. No se usan credenciales reales.' : 'Configura credenciales en backend antes de operar en produccion.')}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button type="button" size="sm" onClick={onConfigure}><Settings size={16} /> Configurar</Button>
        <Button type="button" size="sm" variant="secondary" onClick={onTest}><TestTube2 size={16} /> Probar</Button>
        <Link to={pathMap[integration.provider] ?? '/integrations'} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
          <ExternalLink size={15} /> Ver modulo
        </Link>
      </div>
    </article>
  );
}

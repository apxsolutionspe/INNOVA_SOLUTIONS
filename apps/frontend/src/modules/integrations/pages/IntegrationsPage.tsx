import { RefreshCw, ShieldCheck, TestTube2, Unplug } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { IntegrationCard } from '../components/IntegrationCard';
import { IntegrationConfigModal } from '../components/IntegrationConfigModal';
import { IntegrationTestResultModal } from '../components/IntegrationTestResultModal';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationItem } from '../types/integration.types';

export function IntegrationsPage() {
  const { items, loading, error, test, testResult, setTestResult, load } = useIntegrations();
  const [selected, setSelected] = useState<IntegrationItem | null>(null);
  const counts = useMemo(() => ({
    total: items.length,
    mock: items.filter((item) => item.mode === 'MOCK' || item.status === 'MOCK').length,
    connected: items.filter((item) => item.status === 'CONNECTED' || item.status === 'CONFIGURED').length,
    errors: items.filter((item) => item.status === 'ERROR').length,
  }), [items]);

  return (
    <PageContainer title="Integraciones" description="Centro de APIs externas. Las credenciales privadas viven solo en backend y el modo mock queda visible.">
      <ExecutiveHeader
        eyebrow="Centro externo"
        title="Integraciones profesionales"
        description="Administra estado, modo y pruebas de SUNAT, WhatsApp, pagos online, IA y eCommerce sin exponer secretos en frontend."
        actions={<Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={17} /> Actualizar</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExecutiveKpiCard title="Integraciones" value={counts.total} description="Proveedores registrados" icon={Unplug} tone="blue" />
        <ExecutiveKpiCard title="Modo mock" value={counts.mock} description="Simulación controlada" icon={ShieldCheck} tone="violet" />
        <ExecutiveKpiCard title="Configuradas" value={counts.connected} description="Conectadas o listas" icon={TestTube2} tone="green" />
        <ExecutiveKpiCard title="Errores" value={counts.errors} description="Requieren revisión" icon={Unplug} tone={counts.errors ? 'red' : 'slate'} />
      </div>
      {loading ? <LoadingState rows={4} /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !items.length ? <EmptyState title="Sin integraciones" description="No hay proveedores registrados para mostrar." icon={Unplug} /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <IntegrationCard key={item.provider} integration={item} onConfigure={() => setSelected(item)} onTest={() => void test(item.provider)} />)}
      </div>
      {selected ? <IntegrationConfigModal integration={selected} onClose={() => setSelected(null)} /> : null}
      {testResult ? <IntegrationTestResultModal result={testResult} onClose={() => setTestResult(null)} /> : null}
    </PageContainer>
  );
}

import { useEffect, useState } from 'react';
import { FileCheck2, RefreshCw, ShieldAlert, TestTube2 } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { SunatConfigForm } from '../components/SunatConfigForm';
import { SunatDocumentTable } from '../components/SunatDocumentTable';
import { SunatConfigStatus, sunatService } from '../services/sunat.service';

export function SunatPage() {
  const [config, setConfig] = useState<SunatConfigStatus | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setError('');
    try {
      setConfig(await sunatService.config());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración SUNAT.');
    }
  }

  async function test() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await sunatService.testConnection();
      setMessage(result.message ?? 'Prueba ejecutada correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo probar SUNAT.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <PageContainer title="SUNAT" description="Preparación para facturación electrónica. Actualmente funciona en modo de prueba controlado.">
      <ExecutiveHeader
        eyebrow="Facturación electrónica"
        title="SUNAT"
        description="Gestiona documentos emitidos o simulados y valida la configuración sin exponer certificados ni credenciales."
        actions={
          <>
            <ModeBadge label={config?.mode ?? 'MOCK'} tone={(config?.mode ?? 'MOCK') === 'MOCK' ? 'mock' : 'sandbox'} />
            <Button type="button" variant="secondary" onClick={() => void load()}><RefreshCw size={17} /> Actualizar</Button>
            <Button type="button" onClick={() => void test()} disabled={loading}><TestTube2 size={17} /> Probar</Button>
          </>
        }
      />
      {error ? <ErrorState message={error} /> : null}
      {message ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard title="Modo" value={config?.mode ?? 'MOCK'} description="Emision controlada" icon={ShieldAlert} tone="violet" />
        <ExecutiveKpiCard title="Estado" value={config?.status ?? 'MOCK'} description="Proveedor SUNAT" icon={FileCheck2} tone={(config?.status ?? 'MOCK') === 'ERROR' ? 'red' : 'blue'} />
        <ExecutiveKpiCard title="RUC" value={config?.ruc ?? 'No configurado'} description="Solo variable backend" icon={FileCheck2} tone="slate" />
      </div>
      <ExecutivePanel title="Configuración segura" description="Modo mock activo: no se emiten comprobantes reales a SUNAT. La emisión real requiere credenciales, certificado y validación normativa.">
        <SunatConfigForm />
      </ExecutivePanel>
      <ExecutivePanel title="Documentos SUNAT" description="Comprobantes registrados, aceptados o simulados por el sistema.">
        <SunatDocumentTable />
      </ExecutivePanel>
    </PageContainer>
  );
}



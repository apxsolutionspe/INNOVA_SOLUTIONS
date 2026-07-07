import { useState } from 'react';
import { MessageCircle, Send, TestTube2 } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { WhatsappMessageTable } from '../components/WhatsappMessageTable';
import { WhatsappMessagePreview } from '../components/WhatsappMessagePreview';
import { WhatsappTemplateList } from '../components/WhatsappTemplateList';
import { whatsappService } from '../services/whatsapp.service';

export function WhatsappPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function test() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await whatsappService.testConnection();
      setMessage(result.message ?? 'Prueba ejecutada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo probar WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="WhatsApp" description="Mensajeria avanzada preparada para WhatsApp Business API. Sin token real opera en modo mock.">
      <ExecutiveHeader
        eyebrow="Comunicacion externa"
        title="WhatsApp Cloud API"
        description="Plantillas, historial y pruebas de envío desde backend. Los tokens no se exponen al frontend."
        actions={
          <>
            <ModeBadge label="MOCK / REAL" tone="mock" />
            <Button type="button" onClick={() => void test()} disabled={loading}><TestTube2 size={17} /> Probar conexión</Button>
          </>
        }
      />
      {error ? <ErrorState message={error} /> : null}
      {message ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard title="Modo" value="Prueba segura" description="Sin envío real si no hay token" icon={MessageCircle} tone="violet" />
        <ExecutiveKpiCard title="Plantillas" value="4" description="Ventas, ordenes y avisos" icon={Send} tone="blue" />
        <ExecutiveKpiCard title="Seguridad" value="Backend" description="Token protegido" icon={TestTube2} tone="green" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ExecutivePanel title="Plantillas disponibles" description="Mensajes preparados para operaciones frecuentes.">
          <WhatsappTemplateList />
        </ExecutivePanel>
        <ExecutivePanel title="Vista previa" description="Contenido de ejemplo antes del envío.">
          <WhatsappMessagePreview />
        </ExecutivePanel>
      </div>
      <ExecutivePanel title="Historial de mensajes" description="Mensajes reales o simulados registrados por el backend.">
        <WhatsappMessageTable />
      </ExecutivePanel>
    </PageContainer>
  );
}


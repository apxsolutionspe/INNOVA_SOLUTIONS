import { CreditCard, Link2, ReceiptText, TestTube2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { PaymentLinkForm } from '../components/PaymentLinkForm';
import { PaymentProviderCard } from '../components/PaymentProviderCard';
import { PaymentStatusTable } from '../components/PaymentStatusTable';
import { paymentsService } from '../services/payments.service';

export function PaymentsPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function test() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await paymentsService.testConnection();
      setMessage(result.message ?? 'Prueba ejecutada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo probar pagos online.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="Pasarelas de pago" description="Capa base para Culqi e Izipay con links y webhooks simulados.">
      <ExecutiveHeader
        eyebrow="Pagos online"
        title="Culqi e Izipay"
        description="Enlaces, transacciones y pruebas de conexión desde backend. Las llaves privadas nunca se cargan en frontend."
        actions={
          <>
            <ModeBadge label="MOCK / SANDBOX" tone="mock" />
            <Button type="button" onClick={() => void test()} disabled={loading}><TestTube2 size={17} /> Probar conexión</Button>
          </>
        }
      />
      {error ? <ErrorState message={error} /> : null}
      {message ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard title="Proveedores" value="2" description="Culqi e Izipay" icon={CreditCard} tone="blue" />
        <ExecutiveKpiCard title="Enlaces" value="Modo de prueba" description="Generación controlada" icon={Link2} tone="violet" />
        <ExecutiveKpiCard title="Transacciones" value="Backend" description="Historial seguro" icon={ReceiptText} tone="green" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <PaymentProviderCard name="Culqi" />
        <PaymentProviderCard name="Izipay" />
      </div>
      <ExecutivePanel title="Crear enlace de pago" description="Operación preparada para modo de prueba, sandbox o producción según variables del backend.">
        <PaymentLinkForm />
      </ExecutivePanel>
      <ExecutivePanel title="Transacciones" description="Pagos creados, pendientes, pagados o fallidos.">
        <PaymentStatusTable />
      </ExecutivePanel>
    </PageContainer>
  );
}


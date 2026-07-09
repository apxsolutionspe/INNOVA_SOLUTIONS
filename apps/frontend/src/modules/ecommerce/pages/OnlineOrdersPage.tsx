import { ClipboardList, RefreshCw, ShoppingCart } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { OnlineOrdersTable } from '../components/OnlineOrdersTable';

export function OnlineOrdersPage() {
  return (
    <PageContainer title="Pedidos online" description="Gestión futura de pedidos recibidos desde tienda online.">
      <ExecutiveHeader
        eyebrow="eCommerce"
        title="Pedidos online"
        description="Seguimiento de pedidos web, estados y pagos preparados para integración futura."
        actions={<Button type="button" variant="secondary" onClick={() => window.location.reload()}><RefreshCw size={17} /> Actualizar</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <ExecutiveKpiCard title="Flujo" value="Web" description="Pedidos desde canal online" icon={ShoppingCart} tone="violet" />
        <ExecutiveKpiCard title="Gestión" value="Admin" description="Confirmación y preparación" icon={ClipboardList} tone="blue" />
      </div>
      <ExecutivePanel title="Listado de pedidos" description="Estados: pendiente, confirmado, en preparación, entregado o anulado.">
        <OnlineOrdersTable />
      </ExecutivePanel>
    </PageContainer>
  );
}


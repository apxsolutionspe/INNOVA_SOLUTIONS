import { Package, ShoppingCart, Store } from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { EcommerceProductGrid } from '../components/EcommerceProductGrid';
import { OnlineOrderForm } from '../components/OnlineOrderForm';

export function EcommercePage() {
  return (
    <PageContainer title="eCommerce" description="Base para catalogo online y pedidos web conectados al inventario.">
      <ExecutiveHeader
        eyebrow="Canal digital"
        title="eCommerce interno"
        description="Catalogo online basado en inventario real y pedidos web preparados para futura tienda publica."
        actions={<ModeBadge label="MOCK CONTROLADO" tone="mock" />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard title="Catalogo" value="Inventario" description="Solo productos activos con stock" icon={Package} tone="blue" />
        <ExecutiveKpiCard title="Pedidos" value="Online" description="No descuenta stock hasta confirmar" icon={ShoppingCart} tone="violet" />
        <ExecutiveKpiCard title="Publicacion" value="Preparada" description="URL publica por backend" icon={Store} tone="green" />
      </div>
      <ExecutivePanel title="Catalogo online" description="Productos disponibles para publicacion futura.">
        <EcommerceProductGrid />
      </ExecutivePanel>
      <ExecutivePanel title="Pedido de prueba" description="Registro controlado para validar el flujo eCommerce.">
        <OnlineOrderForm />
      </ExecutivePanel>
    </PageContainer>
  );
}

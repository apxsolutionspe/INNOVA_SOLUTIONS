import { useState } from 'react';
import { ClipboardList } from 'lucide-react';

import { Button, EmptyState, ErrorState } from '../../../components/ui';
import { ServiceOrderFilters } from '../components/ServiceOrderFilters';
import { ServiceOrderForm } from '../components/ServiceOrderForm';
import { ServiceOrderStats } from '../components/ServiceOrderStats';
import { ServiceOrderTable } from '../components/ServiceOrderTable';
import { ServiceOrdersHeader } from '../components/ServiceOrdersHeader';
import { useServiceOrders } from '../hooks/useServiceOrders';

export function ServiceOrdersPage() {
  const orders = useServiceOrders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const hasFilters = Boolean(orders.search.trim() || orders.status);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ServiceOrdersHeader
        isLoading={orders.isLoading}
        onRefresh={() => void orders.reload()}
        onCreate={() => setIsFormOpen(true)}
      />

      <ServiceOrderStats stats={orders.stats} />

      <ServiceOrderFilters
        search={orders.search}
        status={orders.status}
        onSearch={orders.setSearch}
        onStatus={orders.setStatus}
        onRefresh={() => void orders.reload()}
      />

      {orders.error ? (
        <ErrorState
          title="No se pudo cargar el módulo de órdenes técnicas"
          message={orders.error || 'Verifica la conexión con el servidor e intenta nuevamente.'}
          onRetry={() => void orders.reload()}
        />
      ) : (
        <>
          <ServiceOrderTable orders={orders.orders} isLoading={orders.isLoading} />
          {!orders.isLoading && !orders.orders.length ? (
            <EmptyState
              title={hasFilters ? 'No se encontraron ordenes tecnicas' : 'Aun no hay ordenes tecnicas registradas'}
              description={hasFilters ? 'Ajusta la búsqueda o limpia los filtros para ver otras órdenes.' : 'Registra la primera recepción de equipo para iniciar el seguimiento técnico.'}
              icon={ClipboardList}
              action={!hasFilters ? <Button type="button" onClick={() => setIsFormOpen(true)}>Crear primera orden</Button> : undefined}
            />
          ) : null}
        </>
      )}

      {isFormOpen ? <ServiceOrderForm onClose={() => setIsFormOpen(false)} onCreated={orders.reload} /> : null}
    </section>
  );
}



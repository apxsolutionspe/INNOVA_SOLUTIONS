import { QuickService } from '../types/quick-service.types';
import { QuickServiceCard } from './QuickServiceCard';
import { QuickServiceEmptyState } from './QuickServiceEmptyState';
import { QuickServiceLoadingState } from './QuickServiceLoadingState';

export function QuickServiceGrid({
  services,
  isLoading = false,
  onAdd,
  onDetail,
}: {
  services: QuickService[];
  isLoading?: boolean;
  onAdd: (service: QuickService) => void;
  onDetail: (service: QuickService) => void;
}) {
  if (isLoading) return <QuickServiceLoadingState />;
  if (!services.length) {
    return (
      <QuickServiceEmptyState
        title="No hay servicios para mostrar"
        description="Ajusta la busqueda o revisa la administracion de servicios."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {services.map((service) => (
        <QuickServiceCard key={service.id} service={service} onAdd={onAdd} onDetail={onDetail} />
      ))}
    </div>
  );
}

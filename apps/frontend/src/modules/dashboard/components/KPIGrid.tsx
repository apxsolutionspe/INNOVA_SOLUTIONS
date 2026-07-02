import { KPIStat } from '../types/dashboard.types';
import { KPIStatCard } from './KPIStatCard';

interface KPIGridProps {
  metrics: KPIStat[];
  isLoading: boolean;
}

export function KPIGrid({ metrics, isLoading }: KPIGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <KPIStatCard key={metric.label} metric={metric} isLoading={isLoading} index={index} />
      ))}
    </section>
  );
}

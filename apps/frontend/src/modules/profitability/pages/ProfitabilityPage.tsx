import { Download, Printer, ShieldAlert, Trophy } from 'lucide-react';

import { Button } from '../../../components/ui';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { CategoryProfitChart } from '../components/CategoryProfitChart';
import { FinancialAlertsPanel } from '../components/FinancialAlertsPanel';
import { MonthlyProfitTimeline } from '../components/MonthlyProfitTimeline';
import { ProductProfitTable } from '../components/ProductProfitTable';
import { ProfitabilityFilters } from '../components/ProfitabilityFilters';
import { ProfitabilityHeader } from '../components/ProfitabilityHeader';
import { ProfitabilityKpiGrid } from '../components/ProfitabilityKpiGrid';
import { ProfitChart } from '../components/ProfitChart';
import { ServiceProfitTable } from '../components/ServiceProfitTable';
import { useProfitability } from '../hooks/useProfitability';
import { exportProfitabilityCsv, printProfitabilityReport } from '../utils/profitability-export';

export function ProfitabilityPage() {
  const data = useProfitability();
  const summary = data.summary;
  const hasData = Boolean(summary && summary.totalIncome > 0);
  const topProduct = data.products[0];
  const topService = data.services[0];
  const exportData = {
    summary,
    products: data.products,
    services: data.services,
    monthly: data.monthly,
    filters: data.filters,
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ProfitabilityHeader
        margin={summary?.profitMargin ?? 0}
        netProfit={summary?.estimatedNetProfit ?? 0}
        isLoading={data.isLoading}
        onRefresh={() => void data.load()}
      />

      <ProfitabilityFilters filters={data.filters} onChange={data.setFilters} onRefresh={() => void data.load()} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => printProfitabilityReport(exportData)} disabled={data.isLoading}>
          <Printer size={17} />
          Imprimir / Guardar PDF
        </Button>
        <Button type="button" variant="secondary" onClick={() => exportProfitabilityCsv(exportData)} disabled={data.isLoading}>
          <Download size={17} />
          Exportar CSV
        </Button>
      </div>
      {data.error ? <ErrorState message={data.error} onRetry={() => void data.load()} /> : null}
      {data.isLoading ? <LoadingState rows={5} /> : null}

      {!data.error ? <ProfitabilityKpiGrid summary={summary} /> : null}

      {!data.isLoading && !hasData ? (
        <EmptyState title="Datos insuficientes" description="No hay ingresos en el rango seleccionado. Registra ventas, servicios o ajusta los filtros para completar el análisis." icon={ShieldAlert} />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ExecutivePanel title="Tendencia de utilidad" description="Comparativa mensual de ingresos, costos y utilidad neta estimada.">
          <ProfitChart data={data.monthly} />
        </ExecutivePanel>
        <FinancialAlertsPanel summary={summary} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ExecutivePanel title="Rentabilidad por categoría" description="Categorías con mayor contribución estimada.">
          <CategoryProfitChart data={data.categories} />
        </ExecutivePanel>
        <ExecutivePanel title="Lectura destacada" description="Elementos con mayor contribución estimada.">
          <div className="grid gap-3">
            {[{ title: 'Producto más rentable', item: topProduct }, { title: 'Servicio más rentable', item: topService }].map(({ title, item }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
                    <p className="mt-1 truncate text-sm font-black text-slate-900">{item?.name ?? 'Sin datos'}</p>
                    <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
                      <span>Utilidad {formatCurrency(item?.profit ?? 0)}</span>
                      <span>Ingresos {formatCurrency(item?.income ?? 0)}</span>
                      <span>Margen {formatPercent(item?.margin ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!topProduct && !topService ? <EmptyState title="Sin rentabilidad destacada" description="Aún no hay productos o servicios con utilidad calculada." icon={Trophy} /> : null}
          </div>
        </ExecutivePanel>
      </div>

      <ExecutivePanel title="Comparativa mensual" description="Ingreso, costo, gasto y utilidad neta por periodo.">
        <MonthlyProfitTimeline data={data.monthly} />
      </ExecutivePanel>

      <div className="grid gap-5 xl:grid-cols-2">
        <ProductProfitTable title="Productos más rentables" items={data.products} />
        <ServiceProfitTable title="Servicios más rentables" items={data.services} />
      </div>
    </section>
  );
}


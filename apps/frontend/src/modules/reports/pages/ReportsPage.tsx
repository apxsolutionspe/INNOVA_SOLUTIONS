import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { CashReportSection } from '../components/CashReportSection';
import { InventoryReportSection } from '../components/InventoryReportSection';
import { ProfitabilityBasicSection } from '../components/ProfitabilityBasicSection';
import { PurchasesReportSection } from '../components/PurchasesReportSection';
import { QuickServicesReportSection } from '../components/QuickServicesReportSection';
import { ReportFilters } from '../components/ReportFilters';
import { ReportsAlertsPanel } from '../components/ReportsAlertsPanel';
import { ReportsHeader } from '../components/ReportsHeader';
import { ReportsKpiGrid } from '../components/ReportsKpiGrid';
import { SalesReportSection } from '../components/SalesReportSection';
import { ServiceOrdersReportSection } from '../components/ServiceOrdersReportSection';
import { useReports } from '../hooks/useReports';

export function ReportsPage() {
  const reports = useReports();
  const hasSummary = Boolean(reports.summary);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ReportsHeader
        updatedAt={new Date()}
        isLoading={reports.isLoading}
        isExporting={reports.isExporting}
        onRefresh={() => void reports.loadReports()}
        onExportSalesPdf={() => void reports.exportReport('sales', 'pdf')}
        onExportCashExcel={() => void reports.exportReport('cash', 'excel')}
      />

      <ReportFilters filters={reports.filters} onChange={reports.setFilters} onRefresh={() => void reports.loadReports()} />
      {reports.error ? <ErrorState message={reports.error} onRetry={() => void reports.loadReports()} /> : null}
      {reports.isLoading ? <LoadingState rows={6} /> : null}

      {!reports.isLoading && !hasSummary ? (
        <EmptyState title="No hay datos para reportar" description="Cuando se registren ventas, caja, compras o servicios, los reportes se completaran automaticamente." />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <ReportsKpiGrid summary={reports.summary} />
        <ReportsAlertsPanel summary={reports.summary} />
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Detalle analitico</h2>
          <p className="mt-1 text-sm text-slate-500">Bloques operativos por modulo para revisar tendencias, movimientos y exportaciones.</p>
        </div>
        <SalesReportSection report={reports.sales} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} />
        <div className="grid gap-5 2xl:grid-cols-2">
          <InventoryReportSection report={reports.inventory} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} />
          <CashReportSection report={reports.cash} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} />
        </div>
        <div className="grid gap-5 2xl:grid-cols-2">
          <ServiceOrdersReportSection report={reports.serviceOrders} />
          <QuickServicesReportSection report={reports.quickServices} />
        </div>
        <PurchasesReportSection report={reports.purchases} />
        <ProfitabilityBasicSection report={reports.profitability} />
      </section>
    </section>
  );
}

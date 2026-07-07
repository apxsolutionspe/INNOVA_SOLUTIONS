import { useState } from 'react';
import { Banknote, Boxes, BriefcaseBusiness, ClipboardList, Gauge, ReceiptText, ShoppingBag, Zap } from 'lucide-react';

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
import { ReportTabId, ReportTabs } from '../components/ReportTabs';
import { SalesReportSection } from '../components/SalesReportSection';
import { ServiceOrdersReportSection } from '../components/ServiceOrdersReportSection';
import { useReports } from '../hooks/useReports';
import { printReport } from '../utils/report-print';

const tabs = [
  { id: 'executive', label: 'Ejecutivo', icon: Gauge },
  { id: 'sales', label: 'Ventas', icon: ReceiptText },
  { id: 'inventory', label: 'Inventario', icon: Boxes },
  { id: 'service-orders', label: 'Servicios tecnicos', icon: ClipboardList },
  { id: 'quick-services', label: 'Servicios rapidos', icon: Zap },
  { id: 'purchases', label: 'Compras', icon: ShoppingBag },
  { id: 'cash', label: 'Caja', icon: Banknote },
  { id: 'profitability', label: 'Rentabilidad', icon: BriefcaseBusiness },
] satisfies Array<{ id: ReportTabId; label: string; icon: typeof Gauge }>;

export function ReportsPage() {
  const reports = useReports();
  const hasSummary = Boolean(reports.summary);
  const [activeTab, setActiveTab] = useState<ReportTabId>('executive');

  const handlePrint = () => {
    printReport(activeTab, {
      summary: reports.summary,
      sales: reports.sales,
      inventory: reports.inventory,
      serviceOrders: reports.serviceOrders,
      quickServices: reports.quickServices,
      purchases: reports.purchases,
      cash: reports.cash,
      profitability: reports.profitability,
    }, reports.filters);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ReportsHeader
        updatedAt={new Date()}
        isLoading={reports.isLoading}
        isExporting={reports.isExporting}
        onRefresh={() => void reports.loadReports()}
        onExportSalesPdf={() => void reports.exportReport('sales', 'pdf')}
        onExportCashExcel={() => void reports.exportReport('cash', 'excel')}
        onPrint={handlePrint}
      />

      <ReportFilters filters={reports.filters} onChange={reports.setFilters} onRefresh={() => void reports.loadReports()} />
      {reports.error ? <ErrorState message={reports.error} onRetry={() => void reports.loadReports()} /> : null}
      {reports.isLoading ? <LoadingState rows={6} /> : null}

      {!reports.isLoading && !hasSummary ? (
        <EmptyState title="No hay datos para reportar" description="Cuando se registren ventas, caja, compras o servicios, los reportes se completaran automaticamente." />
      ) : null}

      <ReportTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <section className="space-y-5">
        {activeTab === 'executive' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <ReportsKpiGrid summary={reports.summary} />
            <ReportsAlertsPanel summary={reports.summary} />
          </div>
        ) : null}
        {activeTab === 'sales' ? <SalesReportSection report={reports.sales} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} /> : null}
        {activeTab === 'inventory' ? <InventoryReportSection report={reports.inventory} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} /> : null}
        {activeTab === 'service-orders' ? <ServiceOrdersReportSection report={reports.serviceOrders} /> : null}
        {activeTab === 'quick-services' ? <QuickServicesReportSection report={reports.quickServices} /> : null}
        {activeTab === 'purchases' ? <PurchasesReportSection report={reports.purchases} /> : null}
        {activeTab === 'cash' ? <CashReportSection report={reports.cash} isExporting={reports.isExporting} onExport={(module, type) => void reports.exportReport(module, type)} /> : null}
        {activeTab === 'profitability' ? <ProfitabilityBasicSection report={reports.profitability} /> : null}
      </section>
    </section>
  );
}

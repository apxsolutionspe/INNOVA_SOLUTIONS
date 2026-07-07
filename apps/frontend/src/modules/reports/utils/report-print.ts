import {
  CashReport,
  InventoryReport,
  ProfitabilityReport,
  PurchasesReport,
  QuickServicesReport,
  ReportFilters,
  ReportsSummary,
  SalesReport,
  ServiceOrdersReport,
} from '../types/report.types';
import { ReportTabId } from '../components/ReportTabs';
import { formatCurrency, formatDate, formatNumber, formatPercent } from './report-formatters';
import { formatMovementType, formatStatusLabel } from '../../../utils/display-formatters';

interface ReportsSnapshot {
  summary: ReportsSummary | null;
  sales: SalesReport | null;
  inventory: InventoryReport | null;
  serviceOrders: ServiceOrdersReport | null;
  quickServices: QuickServicesReport | null;
  purchases: PurchasesReport | null;
  cash: CashReport | null;
  profitability: ProfitabilityReport | null;
}

const reportTitles: Record<ReportTabId, string> = {
  executive: 'Reporte Ejecutivo',
  sales: 'Reporte de Ventas',
  inventory: 'Reporte de Inventario',
  'service-orders': 'Reporte de Servicios Técnicos',
  'quick-services': 'Reporte de Servicios Rápidos',
  purchases: 'Reporte de Compras',
  cash: 'Reporte de Caja',
  profitability: 'Reporte de Rentabilidad',
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resolveRange(filters: ReportFilters) {
  if (!filters.startDate && !filters.endDate) return 'Periodo completo disponible';
  return `${filters.startDate ? formatDate(filters.startDate) : 'Inicio'} - ${filters.endDate ? formatDate(filters.endDate) : 'Hoy'}`;
}

function cardGrid(cards: Array<{ label: string; value: string | number }>) {
  return `
    <section class="cards">
      ${cards.map((card) => `<article><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong></article>`).join('')}
    </section>
  `;
}

function table(columns: string[], rows: Array<Array<string | number>>) {
  return `
    <table>
      <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.length
          ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
          : `<tr><td colspan="${columns.length}" class="empty">No hay datos para el periodo seleccionado.</td></tr>`}
      </tbody>
    </table>
  `;
}

function buildReportContent(activeReport: ReportTabId, reports: ReportsSnapshot) {
  if (activeReport === 'sales') {
    const report = reports.sales;
    return {
      cards: [
        { label: 'Total vendido', value: formatCurrency(report?.totalSold) },
        { label: 'Ventas', value: formatNumber(report?.salesCount) },
        { label: 'Ticket promedio', value: formatCurrency(report?.averageTicket) },
        { label: 'Anuladas', value: formatNumber(report?.cancelledSales) },
      ],
      columns: ['Fecha', 'Total'],
      rows: report?.salesByDate.map((row) => [formatDate(row.date), formatCurrency(row.total)]) ?? [],
    };
  }

  if (activeReport === 'inventory') {
    const report = reports.inventory;
    return {
      cards: [
        { label: 'Productos', value: formatNumber(report?.totalProducts) },
        { label: 'Activos', value: formatNumber(report?.activeProducts) },
        { label: 'Stock bajo', value: formatNumber(report?.lowStockProducts) },
        { label: 'Valor inventario', value: formatCurrency(report?.inventoryValue) },
      ],
      columns: ['Producto', 'Tipo', 'Cantidad', 'Motivo'],
      rows: report?.movements.slice(0, 40).map((row) => [row.product, formatMovementType(row.type), row.quantity, row.reason]) ?? [],
    };
  }

  if (activeReport === 'service-orders') {
    const report = reports.serviceOrders;
    return {
      cards: [
        { label: 'Recibidas', value: formatNumber(report?.receivedOrders) },
        { label: 'En proceso', value: formatNumber(report?.inProgressOrders) },
        { label: 'Listas', value: formatNumber(report?.readyOrders) },
        { label: 'Ingresos', value: formatCurrency(report?.serviceOrderIncome) },
      ],
      columns: ['Estado', 'Cantidad'],
      rows: report?.ordersByStatus.map((row) => [formatStatusLabel(row.name), row.value ?? 0]) ?? [],
    };
  }

  if (activeReport === 'quick-services') {
    const report = reports.quickServices;
    return {
      cards: [
        { label: 'Operaciones', value: formatNumber(report?.totalQuickServices) },
        { label: 'Ingresos', value: formatCurrency(report?.quickServicesIncome) },
        { label: 'Canceladas', value: formatNumber(report?.cancelledOperations) },
        { label: 'Categorías', value: formatNumber(report?.incomeByCategory.length) },
      ],
      columns: ['Servicio', 'Cantidad', 'Importe'],
      rows: report?.topQuickServices.map((row) => [row.name, row.quantity ?? 0, formatCurrency(row.amount)]) ?? [],
    };
  }

  if (activeReport === 'purchases') {
    const report = reports.purchases;
    return {
      cards: [
        { label: 'Monto comprado', value: formatCurrency(report?.totalPurchasedAmount) },
        { label: 'Pendientes', value: formatNumber(report?.pendingPurchases) },
        { label: 'Recibidas', value: formatNumber(report?.receivedPurchases) },
      ],
      columns: ['Fecha', 'Total'],
      rows: report?.purchasesByPeriod.map((row) => [formatDate(row.date), formatCurrency(row.total)]) ?? [],
    };
  }

  if (activeReport === 'cash') {
    const report = reports.cash;
    return {
      cards: [
        { label: 'Ingresos', value: formatCurrency(report?.income) },
        { label: 'Gastos', value: formatCurrency(report?.expenses) },
        { label: 'Diferencia', value: formatCurrency(report?.cashDifference) },
        { label: 'Cajas cerradas', value: formatNumber(report?.closedSessions) },
      ],
      columns: ['Caja', 'Usuario', 'Estado', 'Diferencia'],
      rows: report?.dailyClosing.map((row) => [row.code, row.user, formatStatusLabel(row.status), formatCurrency(row.difference)]) ?? [],
    };
  }

  if (activeReport === 'profitability') {
    const report = reports.profitability;
    return {
      cards: [
        { label: 'Ingresos', value: formatCurrency(report?.totalIncome) },
        { label: 'Costos', value: formatCurrency(report?.estimatedCosts) },
        { label: 'Utilidad', value: formatCurrency(report?.estimatedGrossProfit) },
        { label: 'Margen', value: formatPercent(report?.estimatedMargin) },
      ],
      columns: ['Producto o servicio', 'Utilidad estimada'],
      rows: [
        ...(report?.mostProfitableProducts.map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)]) ?? []),
        ...(report?.mostProfitableQuickServices.map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)]) ?? []),
      ],
    };
  }

  const summary = reports.summary;
  return {
    cards: [
      { label: 'Ventas', value: formatCurrency(summary?.totalSalesAmount) },
      { label: 'Servicios rápidos', value: formatCurrency(summary?.totalQuickServicesAmount) },
      { label: 'Órdenes técnicas', value: formatCurrency(summary?.totalServiceOrdersAmount) },
      { label: 'Utilidad neta', value: formatCurrency(summary?.netIncome) },
    ],
    columns: ['Indicador', 'Valor'],
    rows: [
      ['Stock crítico', formatNumber(summary?.productsLowStock)],
      ['Órdenes pendientes', formatNumber(summary?.pendingServiceOrders)],
      ['Compras pendientes', formatNumber(summary?.pendingPurchases)],
      ['Gastos', formatCurrency(summary?.totalExpenses)],
    ],
  };
}

export function printReport(activeReport: ReportTabId, reports: ReportsSnapshot, filters: ReportFilters) {
  const report = buildReportContent(activeReport, reports);
  const popup = window.open('', '_blank', 'width=1100,height=800');

  if (!popup) return;

  popup.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(reportTitles[activeReport])}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Inter, Arial, sans-serif; }
          .page { width: min(1080px, 100%); margin: 0 auto; padding: 32px; background: #fff; min-height: 100vh; }
          header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .brand { display: flex; gap: 14px; align-items: center; }
          .logo { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg,#2563eb,#06b6d4,#7c3aed); color: white; font-weight: 900; }
          h1 { margin: 4px 0 0; font-size: 26px; }
          p { margin: 0; color: #64748b; }
          .meta { text-align: right; font-size: 13px; line-height: 1.7; }
          .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          article { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background: #f8fafc; }
          article span { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: .05em; }
          article strong { display: block; margin-top: 8px; font-size: 20px; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
          th { background: #eaf2ff; color: #1e3a8a; text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
          th, td { border: 1px solid #dbe4f0; padding: 10px 12px; }
          td:last-child { text-align: right; font-weight: 800; }
          .empty { text-align: center !important; color: #64748b; padding: 28px; }
          footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 14px; color: #64748b; font-size: 12px; display: flex; justify-content: space-between; }
          @media print {
            body { background: white; }
            .page { padding: 18mm; width: 100%; }
            .no-print { display: none; }
          }
          @media (max-width: 760px) {
            header, footer { flex-direction: column; text-align: left; }
            .meta { text-align: left; }
            .cards { grid-template-columns: 1fr; }
            .page { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header>
            <div class="brand">
              <div class="logo">IS</div>
              <div>
                <p>Innova Solutions - Suite de Gestión</p>
                <h1>${escapeHtml(reportTitles[activeReport])}</h1>
              </div>
            </div>
            <div class="meta">
              <div><strong>Generado:</strong> ${escapeHtml(formatDate(new Date()))}</div>
              <div><strong>Rango:</strong> ${escapeHtml(resolveRange(filters))}</div>
            </div>
          </header>
          ${cardGrid(report.cards)}
          ${table(report.columns, report.rows)}
          <footer>
            <span>Generado por Innova Solutions - Suite de Gestión</span>
            <span>Reporte interno</span>
          </footer>
        </main>
        <script>window.onload = () => { window.focus(); window.print(); };</script>
      </body>
    </html>
  `);
  popup.document.close();
}

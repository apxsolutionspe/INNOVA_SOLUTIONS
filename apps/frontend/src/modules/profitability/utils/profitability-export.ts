import { formatCurrency, formatDate, formatPercent } from '../../reports/utils/report-formatters';
import { MonthlyProfit, ProfitItem, ProfitabilitySummary } from '../types/profitability.types';

interface ProfitabilityExportData {
  summary: ProfitabilitySummary | null;
  products: ProfitItem[];
  services: ProfitItem[];
  monthly: MonthlyProfit[];
  filters: Record<string, string | undefined>;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function resolveRange(filters: Record<string, string | undefined>) {
  if (!filters.startDate && !filters.endDate) return 'Periodo actual';
  return `${filters.startDate ? formatDate(filters.startDate) : 'Inicio'} - ${filters.endDate ? formatDate(filters.endDate) : 'Hoy'}`;
}

function profitabilityRows(items: ProfitItem[]) {
  return items.map((item, index) => [
    `#${index + 1}`,
    item.name,
    item.quantity,
    formatCurrency(item.income),
    formatCurrency(item.cost),
    formatCurrency(item.profit),
    formatPercent(item.margin),
  ]);
}

function table(title: string, rows: Array<Array<string | number>>) {
  return `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr><th>Ranking</th><th>Nombre</th><th>Cantidad</th><th>Ingresos</th><th>Costo</th><th>Utilidad</th><th>Margen</th></tr></thead>
      <tbody>
        ${rows.length
          ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
          : '<tr><td colspan="7" class="empty">No hay datos suficientes.</td></tr>'}
      </tbody>
    </table>
  `;
}

export function printProfitabilityReport(data: ProfitabilityExportData) {
  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) return;

  const summary = data.summary;
  popup.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Reporte de Rentabilidad</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Inter, Arial, sans-serif; }
          .page { width: min(1080px, 100%); margin: 0 auto; padding: 32px; background: #fff; min-height: 100vh; }
          header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .brand { display: flex; gap: 14px; align-items: center; }
          .logo { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg,#2563eb,#06b6d4,#7c3aed); color: white; font-weight: 900; }
          h1 { margin: 4px 0 0; font-size: 26px; }
          h2 { margin: 28px 0 12px; font-size: 18px; }
          p { margin: 0; color: #64748b; }
          .meta { text-align: right; font-size: 13px; line-height: 1.7; }
          .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          article { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background: #f8fafc; }
          article span { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: .05em; }
          article strong { display: block; margin-top: 8px; font-size: 20px; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #eaf2ff; color: #1e3a8a; text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
          th, td { border: 1px solid #dbe4f0; padding: 10px 12px; }
          td:nth-child(n+3) { text-align: right; font-weight: 800; }
          .empty { text-align: center !important; color: #64748b; padding: 28px; }
          footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 14px; color: #64748b; font-size: 12px; display: flex; justify-content: space-between; }
          @media print { body { background: white; } .page { padding: 18mm; width: 100%; } }
          @media (max-width: 760px) { header, footer { flex-direction: column; text-align: left; } .meta { text-align: left; } .cards { grid-template-columns: 1fr; } .page { padding: 20px; } }
        </style>
      </head>
      <body>
        <main class="page">
          <header>
            <div class="brand">
              <div class="logo">IS</div>
              <div>
                <p>Innova Solutions - Suite de Gestión</p>
                <h1>Reporte de Rentabilidad</h1>
              </div>
            </div>
            <div class="meta">
              <div><strong>Generado:</strong> ${escapeHtml(formatDate(new Date()))}</div>
              <div><strong>Rango:</strong> ${escapeHtml(resolveRange(data.filters))}</div>
            </div>
          </header>
          <section class="cards">
            <article><span>Ingresos</span><strong>${escapeHtml(formatCurrency(summary?.totalIncome))}</strong></article>
            <article><span>Costos</span><strong>${escapeHtml(formatCurrency((summary?.productCosts ?? 0) + (summary?.quickServiceCosts ?? 0)))}</strong></article>
            <article><span>Gastos</span><strong>${escapeHtml(formatCurrency(summary?.registeredExpenses))}</strong></article>
            <article><span>Utilidad neta</span><strong>${escapeHtml(formatCurrency(summary?.estimatedNetProfit))}</strong></article>
          </section>
          ${table('Productos rentables', profitabilityRows(data.products))}
          ${table('Servicios rentables', profitabilityRows(data.services))}
          <h2>Comparativa mensual</h2>
          <table>
            <thead><tr><th>Mes</th><th>Ingresos</th><th>Costos</th><th>Gastos</th><th>Utilidad</th></tr></thead>
            <tbody>
              ${data.monthly.length
                ? data.monthly.map((item) => `<tr><td>${escapeHtml(item.month)}</td><td>${escapeHtml(formatCurrency(item.income))}</td><td>${escapeHtml(formatCurrency(item.costs))}</td><td>${escapeHtml(formatCurrency(item.expenses))}</td><td>${escapeHtml(formatCurrency(item.profit))}</td></tr>`).join('')
                : '<tr><td colspan="5" class="empty">No hay datos mensuales.</td></tr>'}
            </tbody>
          </table>
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

export function exportProfitabilityCsv(data: ProfitabilityExportData) {
  const sections = [
    ['Productos rentables'],
    ['Ranking', 'Nombre', 'Cantidad', 'Ingresos', 'Costo', 'Utilidad', 'Margen'],
    ...profitabilityRows(data.products),
    [],
    ['Servicios rentables'],
    ['Ranking', 'Nombre', 'Cantidad', 'Ingresos', 'Costo', 'Utilidad', 'Margen'],
    ...profitabilityRows(data.services),
    [],
    ['Comparativa mensual'],
    ['Mes', 'Ingresos', 'Costos', 'Gastos', 'Utilidad'],
    ...data.monthly.map((item) => [item.month, formatCurrency(item.income), formatCurrency(item.costs), formatCurrency(item.expenses), formatCurrency(item.profit)]),
  ];
  const csv = sections.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte-rentabilidad.csv';
  link.click();
  URL.revokeObjectURL(url);
}


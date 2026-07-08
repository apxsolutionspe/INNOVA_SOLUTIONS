import ExcelJS from 'exceljs';

import { ExportTable } from './pdf-report.exporter';

export class ExcelReportExporter {
  async export(table: ExportTable): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Innova Solutions';
    const summary = workbook.addWorksheet('Resumen');
    const detail = workbook.addWorksheet('Detalle');

    summary.addRow(['Innova Solutions']);
    summary.addRow(['Manager Suite / Sistema Integral de Gestión']);
    summary.addRow([table.title]);
    summary.addRow([`Rango: ${table.dateRange}`]);
    summary.addRow([`Generado: ${new Date().toLocaleString('es-PE')}`]);

    if (table.totals?.length) {
      summary.addRow([]);
      summary.addRow(['Totales']);
      table.totals.forEach(([label, value]) => summary.addRow([label, value]));
    }

    detail.addRow(table.columns);
    table.rows.forEach((row) => detail.addRow(row));

    [summary, detail].forEach((sheet) => {
      sheet.columns.forEach((column) => {
        column.width = 22;
      });
    });

    summary.getRow(1).font = { bold: true, size: 16 };
    summary.getRow(3).font = { bold: true, size: 13 };
    detail.getRow(1).font = { bold: true };
    detail.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

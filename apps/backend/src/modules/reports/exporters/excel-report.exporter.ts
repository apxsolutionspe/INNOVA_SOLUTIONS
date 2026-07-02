import ExcelJS from 'exceljs';

import { ExportTable } from './pdf-report.exporter';

export class ExcelReportExporter {
  async export(table: ExportTable): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Innova Solutions';
    const sheet = workbook.addWorksheet(table.title.slice(0, 31));

    sheet.addRow(['Innova Solutions']);
    sheet.addRow([table.title]);
    sheet.addRow([`Rango: ${table.dateRange}`]);
    sheet.addRow([]);
    sheet.addRow(table.columns);
    table.rows.forEach((row) => sheet.addRow(row));

    if (table.totals?.length) {
      sheet.addRow([]);
      sheet.addRow(['Totales']);
      table.totals.forEach(([label, value]) => sheet.addRow([label, value]));
    }

    sheet.columns.forEach((column) => {
      column.width = 22;
    });
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(5).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

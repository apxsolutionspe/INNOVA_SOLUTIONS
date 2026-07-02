import PDFDocument from 'pdfkit';

export interface ExportTable {
  title: string;
  dateRange: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  totals?: Array<[string, string | number]>;
}

export class PdfReportExporter {
  async export(table: ExportTable): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 42, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(18).text('Innova Solutions', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(13).fillColor('#334155').text(table.title);
    doc.fontSize(9).fillColor('#64748b').text(`Rango: ${table.dateRange}`);
    doc.moveDown();

    const columnWidth = 510 / Math.max(table.columns.length, 1);
    doc.fillColor('#0f172a').fontSize(8);
    table.columns.forEach((column, index) => doc.text(column, 42 + columnWidth * index, doc.y, { width: columnWidth - 6 }));
    doc.moveDown(0.8);
    doc.moveTo(42, doc.y).lineTo(552, doc.y).strokeColor('#cbd5e1').stroke();
    doc.moveDown(0.4);

    table.rows.slice(0, 120).forEach((row) => {
      const y = doc.y;
      row.forEach((cell, index) => doc.fillColor('#334155').text(String(cell), 42 + columnWidth * index, y, { width: columnWidth - 6 }));
      doc.moveDown(0.9);
      if (doc.y > 760) doc.addPage();
    });

    if (table.totals?.length) {
      doc.moveDown();
      doc.fontSize(10).fillColor('#0f172a').text('Totales', { underline: true });
      table.totals.forEach(([label, value]) => doc.text(`${label}: ${value}`));
    }

    doc.end();
    return new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
  }
}

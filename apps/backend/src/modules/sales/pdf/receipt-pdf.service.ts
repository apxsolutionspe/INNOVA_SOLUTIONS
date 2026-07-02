import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptPdfService {
  buildReceiptHtml(sale: any) {
    const customer = sale.customer?.fullName ?? 'Cliente general';
    const payments = sale.payments
      .map((payment: any) => `${payment.method}: S/ ${Number(payment.amount).toFixed(2)}`)
      .join(', ');
    const rows = sale.items
      .map(
        (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>S/ ${Number(item.unitPrice).toFixed(2)}</td>
            <td>S/ ${Number(item.discount).toFixed(2)}</td>
            <td>S/ ${Number(item.total).toFixed(2)}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Comprobante ${sale.code}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .total { font-size: 20px; font-weight: 700; margin-top: 16px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Innova Solutions</h1>
          <p><strong>Venta:</strong> ${sale.code}</p>
          <p><strong>Fecha:</strong> ${new Date(sale.createdAt).toLocaleString('es-PE')}</p>
          <p><strong>Cliente:</strong> ${customer}</p>
          <p><strong>Atendido por:</strong> ${sale.user.fullName}</p>
          <table>
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>P. Unitario</th><th>Descuento</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p><strong>Subtotal:</strong> S/ ${Number(sale.subtotal).toFixed(2)}</p>
          <p><strong>IGV:</strong> S/ ${Number(sale.taxTotal).toFixed(2)}</p>
          <p><strong>Pago:</strong> ${payments}</p>
          <p class="total">Total: S/ ${Number(sale.total).toFixed(2)}</p>
          <p>Gracias por su compra</p>
        </body>
      </html>
    `;
  }

  buildReceiptPdfBuffer(sale: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      document.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      const customer = sale.customer?.fullName ?? 'Cliente general';
      const payments = sale.payments?.length
        ? sale.payments.map((payment: any) => `${payment.method}: S/ ${Number(payment.amount).toFixed(2)}`).join(' | ')
        : 'No registrado';
      const date = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(sale.createdAt));

      document
        .fillColor('#0f172a')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Innova Solutions');
      document
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#475569')
        .text('Sistema integral de gestion para multiservicios tecnologicos')
        .text('Comprobante interno sin validez tributaria SUNAT.');

      document.moveDown(1.3);
      document
        .roundedRect(48, document.y, 500, 76, 8)
        .fillAndStroke('#eff6ff', '#bfdbfe');
      document
        .fillColor('#1d4ed8')
        .fontSize(15)
        .font('Helvetica-Bold')
        .text('COMPROBANTE DE VENTA', 66, document.y + 16);
      document
        .fillColor('#0f172a')
        .fontSize(11)
        .text(`Codigo: ${sale.code}`, 66, document.y + 8)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`Fecha: ${date}`, 66, document.y + 6)
        .text(`Cliente: ${customer}`, 300, document.y - 28)
        .text(`Atendido por: ${sale.user?.fullName ?? 'Usuario'}`, 300, document.y + 6);

      document.moveDown(3);
      const tableTop = document.y;
      document
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#334155')
        .text('Descripcion', 48, tableTop)
        .text('Cant.', 305, tableTop, { width: 45, align: 'right' })
        .text('P. Unit.', 365, tableTop, { width: 70, align: 'right' })
        .text('Total', 460, tableTop, { width: 88, align: 'right' });
      document.moveTo(48, tableTop + 16).lineTo(548, tableTop + 16).strokeColor('#cbd5e1').stroke();

      let y = tableTop + 28;
      document.font('Helvetica').fontSize(9).fillColor('#0f172a');
      for (const item of sale.items ?? []) {
        if (y > 690) {
          document.addPage();
          y = 48;
        }
        document.text(item.description, 48, y, { width: 240 });
        document.text(String(item.quantity), 305, y, { width: 45, align: 'right' });
        document.text(`S/ ${Number(item.unitPrice).toFixed(2)}`, 365, y, { width: 70, align: 'right' });
        document.text(`S/ ${Number(item.total).toFixed(2)}`, 460, y, { width: 88, align: 'right' });
        y += 24;
      }

      document.moveTo(48, y).lineTo(548, y).strokeColor('#e2e8f0').stroke();
      y += 18;
      document.font('Helvetica').fontSize(10).fillColor('#334155');
      document.text(`Metodo de pago: ${payments}`, 48, y, { width: 300 });
      document.text(`Subtotal: S/ ${Number(sale.subtotal).toFixed(2)}`, 380, y, { width: 168, align: 'right' });
      y += 18;
      document.text(`IGV: S/ ${Number(sale.taxTotal).toFixed(2)}`, 380, y, { width: 168, align: 'right' });
      y += 22;
      document.font('Helvetica-Bold').fontSize(16).fillColor('#16a34a');
      document.text(`Total: S/ ${Number(sale.total).toFixed(2)}`, 380, y, { width: 168, align: 'right' });

      document
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text('Gracias por confiar en Innova Solutions.', 48, 760, { align: 'center', width: 500 });

      document.end();
    });
  }
}

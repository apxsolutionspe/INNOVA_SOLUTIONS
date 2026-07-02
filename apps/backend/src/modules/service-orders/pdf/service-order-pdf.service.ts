import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceOrderPdfService {
  buildReceiptHtml(order: any) {
    const items = order.items
      .map(
        (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>S/ ${Number(item.unitPrice).toFixed(2)}</td>
            <td>S/ ${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Orden ${order.code}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .total { text-align: right; font-size: 20px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Innova Solutions</h1>
          <p><strong>Orden:</strong> ${order.code}</p>
          <p><strong>Recepcion:</strong> ${new Date(order.receivedAt).toLocaleString('es-PE')}</p>
          <p><strong>Cliente:</strong> ${order.customer.fullName}</p>
          <p><strong>Telefono:</strong> ${order.customer.phone ?? '-'}</p>
          <p><strong>Equipo:</strong> ${order.equipmentType} ${order.brand ?? ''} ${order.model ?? ''}</p>
          <p><strong>Serie:</strong> ${order.serialNumber ?? '-'}</p>
          <p><strong>Falla reportada:</strong> ${order.reportedIssue}</p>
          <p><strong>Diagnostico:</strong> ${order.technicalDiagnosis ?? '-'}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <p><strong>Recibido por:</strong> ${order.user.fullName}</p>
          <table>
            <thead><tr><th>Repuesto/Servicio</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <p><strong>Mano de obra:</strong> S/ ${Number(order.laborCost).toFixed(2)}</p>
          <p class="total">Total: S/ ${Number(order.total).toFixed(2)}</p>
          <p>Conserve este comprobante para recoger su equipo</p>
        </body>
      </html>
    `;
  }
}

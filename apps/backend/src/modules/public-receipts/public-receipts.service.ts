import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PublicReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async saleReceipt(idOrCode: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    if (!sale) throw new NotFoundException('Comprobante no encontrado');

    return this.buildHtml({
      title: 'Comprobante de venta',
      code: sale.code,
      date: sale.createdAt,
      customerName: sale.customer?.fullName ?? 'Cliente general',
      rows: sale.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.total),
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discountTotal),
      taxTotal: Number(sale.taxTotal),
      total: Number(sale.total),
      paymentMethod: sale.payments.map((payment) => payment.method).join(', ') || sale.paymentStatus,
      status: sale.status,
    });
  }

  async quickServiceReceipt(idOrCode: string) {
    const sale = await this.prisma.quickServiceSale.findFirst({
      where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!sale) throw new NotFoundException('Comprobante no encontrado');

    return this.buildHtml({
      title: 'Comprobante de servicio rapido',
      code: sale.code,
      date: sale.createdAt,
      customerName: sale.customer?.fullName ?? 'Cliente general',
      rows: sale.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      taxTotal: 0,
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      status: sale.status,
    });
  }

  async serviceOrderReceipt(idOrCode: string) {
    const order = await this.prisma.serviceOrder.findFirst({
      where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) throw new NotFoundException('Comprobante no encontrado');

    const rows = order.items.length
      ? order.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        }))
      : [{ description: order.reportedIssue, quantity: 1, unitPrice: Number(order.total), subtotal: Number(order.total) }];

    return this.buildHtml({
      title: 'Orden tecnica',
      code: order.code,
      date: order.createdAt,
      customerName: order.customer.fullName,
      rows,
      subtotal: Number(order.laborCost) + Number(order.partsCost),
      discount: Number(order.discount),
      taxTotal: 0,
      total: Number(order.total),
      paymentMethod: 'Segun atencion en tienda',
      status: order.status,
      extra: [
        ['Equipo', order.equipmentType],
        ['Marca', order.brand],
        ['Modelo', order.model],
        ['Serie', order.serialNumber],
        ['Falla reportada', order.reportedIssue],
        ['Diagnostico', order.technicalDiagnosis],
      ],
    });
  }

  private buildHtml(data: {
    title: string;
    code: string;
    date: Date;
    customerName: string;
    rows: Array<{ description: string; quantity: number; unitPrice: number; subtotal: number }>;
    subtotal: number;
    discount: number;
    taxTotal: number;
    total: number;
    paymentMethod: string;
    status: string;
    extra?: Array<[string, string | null]>;
  }) {
    const rows = data.rows
      .map(
        (item) => `
          <tr>
            <td>${this.escape(item.description)}</td>
            <td>${item.quantity}</td>
            <td>S/ ${item.unitPrice.toFixed(2)}</td>
            <td>S/ ${item.subtotal.toFixed(2)}</td>
          </tr>`,
      )
      .join('');
    const extra = (data.extra ?? [])
      .filter(([, value]) => Boolean(value))
      .map(([label, value]) => `<p><strong>${this.escape(label)}:</strong> ${this.escape(value ?? '')}</p>`)
      .join('');

    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escape(data.title)} ${this.escape(data.code)} - Innova Solutions</title>
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { margin: 0; background: #f6f8fb; color: #0f172a; }
      main { width: min(760px, calc(100% - 24px)); margin: 24px auto; }
      .receipt { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 24px; background: #fff; box-shadow: 0 24px 70px rgba(15,23,42,.10); }
      header { background: linear-gradient(135deg, #1d4ed8, #06b6d4 58%, #7c3aed); color: white; padding: 28px; }
      h1, h2, p { margin: 0; }
      h1 { font-size: 28px; letter-spacing: -.02em; }
      .subtitle { margin-top: 8px; color: rgba(255,255,255,.86); font-weight: 700; }
      section { padding: 24px 28px; border-top: 1px solid #eef2f7; }
      .grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .label { color: #64748b; font-size: 12px; font-weight: 900; text-transform: uppercase; }
      .value { margin-top: 4px; font-weight: 800; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { padding: 12px 10px; border-bottom: 1px solid #eef2f7; text-align: left; }
      th { color: #475569; font-size: 12px; text-transform: uppercase; }
      .total { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding: 18px; border-radius: 18px; background: #ecfdf5; color: #047857; font-weight: 950; font-size: 22px; }
      .thanks { color: #475569; line-height: 1.7; }
      @media (max-width: 620px) { main { margin: 12px auto; } header, section { padding: 20px; } .grid { grid-template-columns: 1fr; } table { font-size: 12px; } th, td { padding: 10px 6px; } }
    </style>
  </head>
  <body>
    <main>
      <article class="receipt">
        <header>
          <h1>Innova Solutions</h1>
          <p class="subtitle">${this.escape(data.title)} ${this.escape(data.code)}</p>
        </header>
        <section class="grid">
          <div><p class="label">Cliente</p><p class="value">${this.escape(data.customerName)}</p></div>
          <div><p class="label">Fecha</p><p class="value">${this.formatDate(data.date)}</p></div>
          <div><p class="label">Codigo</p><p class="value">${this.escape(data.code)}</p></div>
          <div><p class="label">Estado</p><p class="value">${this.escape(data.status)}</p></div>
          <div><p class="label">Metodo de pago</p><p class="value">${this.escape(data.paymentMethod)}</p></div>
        </section>
        ${extra ? `<section>${extra}</section>` : ''}
        <section>
          <table>
            <thead><tr><th>Detalle</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total"><span>Total</span><span>S/ ${data.total.toFixed(2)}</span></div>
        </section>
        <section>
          <p class="thanks">Gracias por confiar en Innova Solutions. Este comprobante es una constancia operativa del sistema y no reemplaza documentos tributarios electronicos cuando correspondan.</p>
        </section>
      </article>
    </main>
  </body>
</html>`;
  }

  private escape(value: string) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

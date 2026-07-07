import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceOrderPdfService {
  buildReceiptHtml(order: any) {
    const items = (order.items ?? [])
      .map(
        (item: any) => `
          <tr>
            <td>${this.escape(item.description)}</td>
            <td class="center">${item.quantity}</td>
            <td>S/ ${Number(item.unitPrice).toFixed(2)}</td>
            <td>S/ ${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `,
      )
      .join('');
    const photos = (order.photos ?? [])
      .map(
        (photo: any) => `
          <figure>
            <img src="${photo.imageData}" alt="Foto de recepción" />
            <figcaption>${this.escape(photo.fileName ?? 'Evidencia de recepción')}</figcaption>
          </figure>
        `,
      )
      .join('');
    const receivedAt = new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(order.receivedAt));
    const estimatedDate = order.estimatedDeliveryDate
      ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(order.estimatedDeliveryDate))
      : 'Por confirmar';

    return `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Constancia ${this.escape(order.code)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
            main { width: min(920px, 100%); margin: 0 auto; padding: 28px; background: #fff; }
            header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; }
            h1 { margin: 0; font-size: 26px; letter-spacing: -0.02em; }
            h2 { margin: 0 0 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; color: #2563eb; }
            p { margin: 0; line-height: 1.45; }
            .muted { color: #64748b; font-size: 12px; }
            .code { text-align: right; }
            .code strong { display: block; font-size: 22px; color: #1d4ed8; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
            section { border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #fff; }
            .full { grid-column: 1 / -1; }
            dl { display: grid; grid-template-columns: 150px 1fr; gap: 8px 12px; margin: 0; font-size: 13px; }
            dt { color: #64748b; font-weight: 700; }
            dd { margin: 0; font-weight: 700; color: #111827; }
            .text-block { white-space: pre-wrap; color: #334155; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
            .center { text-align: center; }
            .total { margin-top: 14px; text-align: right; font-size: 24px; font-weight: 800; color: #047857; }
            .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            figure { margin: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #f8fafc; }
            img { display: block; width: 100%; height: 120px; object-fit: cover; }
            figcaption { padding: 8px; font-size: 11px; color: #475569; }
            footer { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #475569; }
            .print-button { position: fixed; right: 20px; bottom: 20px; border: 0; border-radius: 999px; background: #2563eb; color: white; padding: 11px 18px; font-weight: 800; cursor: pointer; box-shadow: 0 16px 30px rgba(37, 99, 235, 0.25); }
            @media print {
              body { background: #fff; }
              main { padding: 0; }
              .print-button { display: none; }
              section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main>
            <header>
              <div>
                <h1>Innova Solutions</h1>
                <p class="muted">Constancia de recepción de equipo</p>
                <p class="muted">Servicio técnico y soporte especializado</p>
              </div>
              <div class="code">
                <span class="muted">Orden técnica</span>
                <strong>${this.escape(order.code)}</strong>
                <p class="muted">${receivedAt}</p>
              </div>
            </header>

            <div class="grid">
              <section>
                <h2>Cliente</h2>
                <dl>
                  <dt>Nombre</dt><dd>${this.escape(order.customer.fullName)}</dd>
                  <dt>Teléfono</dt><dd>${this.escape(order.customer.phone ?? '-')}</dd>
                  <dt>Documento</dt><dd>${this.escape(order.customer.documentNumber ?? '-')}</dd>
                  <dt>Correo</dt><dd>${this.escape(order.customer.email ?? '-')}</dd>
                </dl>
              </section>

              <section>
                <h2>Equipo recibido</h2>
                <dl>
                  <dt>Tipo</dt><dd>${this.escape(order.equipmentType)}</dd>
                  <dt>Marca / modelo</dt><dd>${this.escape(`${order.brand ?? '-'} ${order.model ?? ''}`.trim())}</dd>
                  <dt>Serie</dt><dd>${this.escape(order.serialNumber ?? '-')}</dd>
                  <dt>Color</dt><dd>${this.escape(order.color ?? '-')}</dd>
                  <dt>Entrega estimada</dt><dd>${estimatedDate}</dd>
                </dl>
              </section>

              <section class="full">
                <h2>Recepción y estado físico</h2>
                <dl>
                  <dt>Estado visible</dt><dd>${this.escape(order.physicalCondition ?? 'Sin observaciones visibles')}</dd>
                  <dt>Accesorios</dt><dd>${this.escape(order.accessoriesReceived ?? 'No se registraron accesorios')}</dd>
                  <dt>Recibido por</dt><dd>${this.escape(order.user.fullName)}</dd>
                  <dt>Estado actual</dt><dd>${this.escape(order.status)}</dd>
                </dl>
              </section>

              <section>
                <h2>Falla reportada</h2>
                <p class="text-block">${this.escape(order.reportedIssue)}</p>
              </section>

              <section>
                <h2>Diagnóstico inicial</h2>
                <p class="text-block">${this.escape(order.initialDiagnosis ?? 'Pendiente de revisión técnica.')}</p>
              </section>

              <section class="full">
                <h2>Notas de recepción</h2>
                <p class="text-block">${this.escape(order.receptionNotes ?? order.notes ?? 'Sin notas adicionales.')}</p>
              </section>

              <section class="full">
                <h2>Repuestos o servicios agregados</h2>
                <table>
                  <thead><tr><th>Detalle</th><th class="center">Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
                  <tbody>${items || '<tr><td colspan="4">Aún no se registraron repuestos ni servicios adicionales.</td></tr>'}</tbody>
                </table>
                <p class="total">Total estimado: S/ ${Number(order.total).toFixed(2)}</p>
              </section>

              ${photos ? `<section class="full"><h2>Evidencia fotográfica</h2><div class="photos">${photos}</div></section>` : ''}
            </div>

            <footer>
              <strong>Conserve este comprobante para recoger su equipo.</strong>
              <p>La entrega se realiza previa validación de identidad, conformidad del servicio y pago correspondiente si aplica.</p>
            </footer>
          </main>
          <button class="print-button" onclick="window.print()">Imprimir constancia</button>
        </body>
      </html>
    `;
  }

  private escape(value: unknown) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

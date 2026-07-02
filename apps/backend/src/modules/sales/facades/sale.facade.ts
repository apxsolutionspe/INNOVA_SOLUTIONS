import { Injectable } from '@nestjs/common';

@Injectable()
export class SaleFacade {
  calculateTotals(
    items: Array<{ subtotal: number; discount: number; total: number }>,
    taxSettings: { applyIgv: boolean; igvRate: number },
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
    const taxableBase = Math.max(items.reduce((sum, item) => sum + item.total, 0), 0);
    const igvRate = Number.isFinite(taxSettings.igvRate) ? taxSettings.igvRate : 0;
    const taxTotal = taxSettings.applyIgv ? Number((taxableBase * igvRate).toFixed(2)) : 0;
    const total = Number((taxableBase + taxTotal).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal,
      total,
      applyIgv: taxSettings.applyIgv,
      igvRate,
    };
  }
}

import { CartItem, PaymentInput, SalePreviewTotals } from '../types/pos.types';

const roundMoney = (value: number) => Number(value.toFixed(2));

export function calculateSalePreview(
  cart: CartItem[],
  payments: PaymentInput[],
  taxSettings: { applyIgv: boolean; igvRate: number } = { applyIgv: false, igvRate: 0.18 },
): SalePreviewTotals {
  const subtotal = roundMoney(cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0,
  ));
  const discountTotal = roundMoney(cart.reduce((sum, item) => sum + item.discount, 0));
  const taxableBase = roundMoney(Math.max(subtotal - discountTotal, 0));
  const igvRate = Number.isFinite(taxSettings.igvRate) ? taxSettings.igvRate : 0;
  const taxTotal = taxSettings.applyIgv ? roundMoney(taxableBase * igvRate) : 0;
  const total = roundMoney(taxableBase + taxTotal);
  const paid = roundMoney(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));

  return {
    subtotal,
    discountTotal,
    taxableBase,
    taxTotal,
    total,
    paid,
    pending: roundMoney(Math.max(total - paid, 0)),
    change: roundMoney(Math.max(paid - total, 0)),
    applyIgv: taxSettings.applyIgv,
    igvRate,
  };
}

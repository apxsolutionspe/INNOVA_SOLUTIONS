export const PURCHASE_TAX_RATE = 0.18;

export function calculatePurchasePreview(items: Array<{ quantity: number; unitCost: number }>, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const taxTotal = taxable * PURCHASE_TAX_RATE;
  return { subtotal, taxTotal, total: taxable + taxTotal };
}

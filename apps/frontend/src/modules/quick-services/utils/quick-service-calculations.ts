import { QuickServiceCartItem } from '../types/quick-service.types';

export function calculateQuickServiceTotal(cart: QuickServiceCartItem[], discount: number) {
  const subtotal = cart.reduce((sum, item) => sum + item.service.unitPrice * item.quantity, 0);
  return { subtotal, discount, total: Math.max(subtotal - discount, 0) };
}

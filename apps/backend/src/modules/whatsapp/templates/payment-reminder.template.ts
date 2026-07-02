export function paymentReminderTemplate(code: string, amount: number) {
  return `Innova Solutions: recordatorio de pago ${code} por S/ ${amount.toFixed(2)}.`;
}

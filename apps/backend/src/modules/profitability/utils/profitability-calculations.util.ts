export function calculateMargin(profit: number, income: number) {
  return income > 0 ? (profit / income) * 100 : 0;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

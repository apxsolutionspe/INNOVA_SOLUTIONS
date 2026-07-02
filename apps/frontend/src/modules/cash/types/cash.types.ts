export type CashSessionStatus = 'OPEN' | 'CLOSED';
export type CashMovementType = 'INCOME' | 'EXPENSE' | 'SALE' | 'SERVICE_PAYMENT' | 'ADJUSTMENT';
export type PaymentMethod = 'CASH' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED';

export interface CashMovement {
  id: string;
  type: CashMovementType;
  concept: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CashSession {
  id: string;
  code: string;
  openingAmount: number;
  expectedCashAmount: number;
  realCashAmount?: number | null;
  difference: number;
  totalSales: number;
  totalExpenses: number;
  totalCash: number;
  totalYape: number;
  totalPlin: number;
  totalTransfer: number;
  status: CashSessionStatus;
  openedAt: string;
  closedAt?: string | null;
  notes?: string | null;
  movements: CashMovement[];
}

export interface CashSummary {
  currentCashStatus: CashSessionStatus;
  totalCashToday: number;
  totalYapeToday: number;
  totalPlinToday: number;
  totalTransferToday: number;
  expensesToday: number;
  netCashToday: number;
}

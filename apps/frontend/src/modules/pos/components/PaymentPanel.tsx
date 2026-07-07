import { useEffect, useState } from 'react';
import { Banknote, Building2, CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react';

import { PaymentInput, PaymentMethod } from '../types/pos.types';

const methods: Array<{ value: Exclude<PaymentMethod, 'MIXED'>; label: string; icon: typeof Banknote }> = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote },
  { value: 'YAPE', label: 'Yape', icon: Smartphone },
  { value: 'PLIN', label: 'Plin', icon: Smartphone },
  { value: 'TRANSFER', label: 'Transferencia', icon: Building2 },
];

function sanitizeMoneyInput(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const [integer = '', ...decimalParts] = normalized.split('.');
  const decimal = decimalParts.join('').slice(0, 2);
  return decimalParts.length ? `${integer}.${decimal}` : integer;
}

function parseMoneyInput(value: string) {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

interface PaymentPanelProps {
  payments: PaymentInput[];
  total: number;
  onChange: (payments: PaymentInput[]) => void;
}

export function PaymentPanel({ payments, total, onChange }: PaymentPanelProps) {
  const updatePayment = (index: number, payment: PaymentInput) => {
    onChange(payments.map((item, currentIndex) => (currentIndex === index ? payment : item)));
  };

  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pending = Math.max(total - paid, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
            <CreditCard size={17} />
            Pago
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {payments.length > 1 ? 'Pago mixto activo' : 'Método de pago principal'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...payments, { method: 'YAPE', amount: Number(pending.toFixed(2)), reference: '' }])}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-black text-brand-blue transition hover:bg-blue-100 sm:min-h-9"
        >
          <Plus size={14} />
          Pago mixto
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {payments.map((payment, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="grid flex-1 grid-cols-2 gap-2">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const isActive = payment.method === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => updatePayment(index, { ...payment, method: method.value })}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-black transition sm:min-h-10 ${
                        isActive
                          ? 'border-brand-blue bg-brand-blue text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-cyan'
                      }`}
                    >
                      <Icon size={15} />
                      {method.label}
                    </button>
                  );
                })}
              </div>
              {payments.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onChange(payments.filter((_, currentIndex) => currentIndex !== index))}
                  className="grid h-11 w-full shrink-0 place-items-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 sm:h-10 sm:w-10"
                  title="Quitar pago"
                >
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-slate-500">Monto pagado</span>
                <MoneyInput
                  value={payment.amount}
                  onChange={(amount) => updatePayment(index, { ...payment, amount })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-500">
                  Referencia {payment.method === 'CASH' ? 'opcional' : 'obligatoria'}
                </span>
                <input
                  value={payment.reference ?? ''}
                  onChange={(event) => updatePayment(index, { ...payment, reference: event.target.value })}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100"
                  placeholder={payment.method === 'CASH' ? 'Opcional' : 'Código u operación'}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
        <span>Pendiente</span>
        <span>S/ {pending.toFixed(2)}</span>
      </div>
    </div>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? String(value) : '');

  useEffect(() => {
    setDisplayValue(value > 0 ? String(value) : '');
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={() => {
        if (displayValue === '0' || displayValue === '0.00') setDisplayValue('');
      }}
      onChange={(event) => {
        const sanitized = sanitizeMoneyInput(event.target.value);
        setDisplayValue(sanitized);
        onChange(parseMoneyInput(sanitized));
      }}
      onBlur={() => {
        if (!displayValue.trim() || parseMoneyInput(displayValue) === 0) {
          setDisplayValue('');
          onChange(0);
        }
      }}
      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100"
      placeholder="0.00"
    />
  );
}


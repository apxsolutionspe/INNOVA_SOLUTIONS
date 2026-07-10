import { useEffect, useState } from 'react';
import { AlertTriangle, Banknote, Building2, CheckCircle2, CreditCard, Loader2, Smartphone, UserRound } from 'lucide-react';

import { Customer } from '../../customers/types/customer.types';
import { getCustomerSelectLabel } from '../../customers/utils/customer-display';
import { PaymentMethod } from '../types/quick-service.types';

interface QuickServicePaymentPanelProps {
  customers: Customer[];
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  reference: string;
  setReference: (value: string) => void;
  discount: number;
  setDiscount: (value: number) => void;
  subtotal: number;
  total: number;
  isSaving: boolean;
  disabledReason?: string;
  onConfirm: () => void;
}

const methods: Array<{ value: Exclude<PaymentMethod, 'MIXED'>; label: string; icon: typeof Banknote }> = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote },
  { value: 'YAPE', label: 'Yape', icon: Smartphone },
  { value: 'PLIN', label: 'Plin', icon: Smartphone },
  { value: 'TRANSFER', label: 'Transferencia', icon: Building2 },
];

function money(value: number) {
  return `S/ ${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
}

export function QuickServicePaymentPanel(props: QuickServicePaymentPanelProps) {
  const [discountInput, setDiscountInput] = useState(() => (props.discount ? String(props.discount) : '0'));
  const isDiscountInvalid = props.discount > props.subtotal;
  const isDisabled = props.isSaving || Boolean(props.disabledReason) || isDiscountInvalid;

  useEffect(() => {
    setDiscountInput(props.discount ? String(props.discount) : '0');
  }, [props.discount]);

  const updateDiscount = (value: string) => {
    const cleanValue = value.replace(',', '.').replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const normalized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanValue;
    setDiscountInput(normalized);

    if (!normalized) {
      props.setDiscount(0);
      return;
    }

    const numericValue = Number(normalized);
    props.setDiscount(Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0);
  };

  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-brand-violet via-brand-blue to-brand-cyan p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-cyan-50">Total a cobrar</p>
            <p className="mt-1 text-3xl font-black">{money(props.total)}</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <label className="block">
          <span className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
            <UserRound size={17} />
            Cliente
          </span>
          <select
            value={props.customer?.id ?? ''}
            onChange={(event) => props.setCustomer(props.customers.find((customer) => customer.id === event.target.value) ?? null)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">Cliente general</option>
            {props.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{getCustomerSelectLabel(customer)}</option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-sm font-black text-slate-900">Método de pago</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {methods.map((method) => {
              const Icon = method.icon;
              const isActive = props.paymentMethod === method.value;
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => props.setPaymentMethod(method.value)}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-black transition ${
                    isActive
                      ? 'border-brand-blue bg-brand-blue text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-cyan'
                  }`}
                >
                  <Icon size={15} />
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">
              Referencia {props.paymentMethod === 'CASH' ? 'opcional' : 'obligatoria'}
            </span>
            <input
              value={props.reference}
              onChange={(event) => props.setReference(event.target.value)}
              placeholder={props.paymentMethod === 'CASH' ? 'Opcional' : 'Código u operación'}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500">Descuento</span>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">S/</span>
              <input
                type="text"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={discountInput}
                onFocus={() => {
                  if (discountInput === '0' || discountInput === '0.00') setDiscountInput('');
                }}
                onBlur={() => {
                  if (!discountInput.trim()) {
                    setDiscountInput('0');
                    props.setDiscount(0);
                  }
                }}
                onChange={(event) => updateDiscount(event.target.value)}
                placeholder="0.00"
                className={`h-11 w-full rounded-lg border bg-slate-50 pl-10 pr-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                  isDiscountInvalid
                    ? 'border-orange-300 focus:border-orange-400 focus:ring-orange-100'
                    : 'border-slate-200 focus:border-brand-cyan focus:ring-cyan-100'
                }`}
              />
            </div>
          </label>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="flex justify-between"><span>Subtotal</span><strong>{money(props.subtotal)}</strong></p>
          <p className="flex justify-between"><span>Descuento</span><strong>{money(props.discount)}</strong></p>
          <p className="flex justify-between border-t border-slate-200 pt-2 text-slate-950"><span>Total</span><strong>{money(props.total)}</strong></p>
        </div>

        {isDiscountInvalid ? (
          <div className="flex gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold leading-5 text-orange-800">
            <AlertTriangle className="mt-0.5 shrink-0" size={15} />
            El descuento no puede superar el subtotal.
          </div>
        ) : props.disabledReason ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold leading-5 text-orange-800">
            {props.disabledReason}
          </div>
        ) : null}

        <button
          type="button"
          onClick={props.onConfirm}
          disabled={isDisabled}
          className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-blue text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {props.isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {props.isSaving ? 'Registrando...' : 'Confirmar operación'}
        </button>
      </div>
    </div>
  );
}

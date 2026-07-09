import { Banknote, Building2, CheckCircle2, CreditCard, Loader2, Smartphone, UserRound } from 'lucide-react';

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

export function QuickServicePaymentPanel(props: QuickServicePaymentPanelProps) {
  const isDisabled = props.isSaving || Boolean(props.disabledReason);

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-brand-violet via-brand-blue to-brand-cyan p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-cyan-50">Total a cobrar</p>
            <p className="mt-1 text-3xl font-black">S/ {props.total.toFixed(2)}</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
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
          <input
            type="number"
            min="0"
            max={props.subtotal}
            step="0.01"
            value={props.discount}
            onChange={(event) => props.setDiscount(Number(event.target.value))}
            className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="flex justify-between"><span>Subtotal</span><strong>S/ {props.subtotal.toFixed(2)}</strong></p>
          <p className="flex justify-between"><span>Descuento</span><strong>S/ {props.discount.toFixed(2)}</strong></p>
          <p className="flex justify-between border-t border-slate-200 pt-2 text-slate-950"><span>Total</span><strong>S/ {props.total.toFixed(2)}</strong></p>
        </div>

        {props.disabledReason ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold leading-5 text-orange-800">
            {props.disabledReason}
          </div>
        ) : null}

        <button
          type="button"
          onClick={props.onConfirm}
          disabled={isDisabled}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-blue text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {props.isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {props.isSaving ? 'Registrando...' : 'Confirmar operación'}
        </button>
      </div>
    </div>
  );
}


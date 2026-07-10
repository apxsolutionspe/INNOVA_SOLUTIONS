import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, ClipboardCheck, PackageCheck, X } from 'lucide-react';

import { AdjustStockPayload, InventoryMovementType, Product } from '../types/inventory.types';

interface AdjustStockModalProps {
  product: Product;
  onSubmit: (payload: AdjustStockPayload) => Promise<void>;
  onClose: () => void;
}

interface MovementOption {
  type: InventoryMovementType;
  title: string;
  description: string;
  icon: typeof ArrowUpCircle;
  tone: string;
  activeTone: string;
}

const movementOptions: MovementOption[] = [
  {
    type: 'IN',
    title: 'Entrada de stock',
    description: 'Aumenta el stock disponible.',
    icon: ArrowUpCircle,
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    activeTone: 'border-emerald-400 bg-emerald-100 ring-4 ring-emerald-100',
  },
  {
    type: 'OUT',
    title: 'Salida de stock',
    description: 'Disminuye el stock disponible.',
    icon: ArrowDownCircle,
    tone: 'border-orange-100 bg-orange-50 text-orange-700',
    activeTone: 'border-orange-400 bg-orange-100 ring-4 ring-orange-100',
  },
  {
    type: 'ADJUSTMENT',
    title: 'Corrección de inventario',
    description: 'Ajusta el stock por conteo físico o regularización.',
    icon: ClipboardCheck,
    tone: 'border-blue-100 bg-blue-50 text-blue-700',
    activeTone: 'border-blue-400 bg-blue-100 ring-4 ring-blue-100',
  },
];

function resolveResultingStock(currentStock: number, type: InventoryMovementType, quantity: number) {
  if (type === 'IN') return currentStock + quantity;
  if (type === 'OUT') return currentStock - quantity;
  return quantity;
}

function movementLabel(type: InventoryMovementType, quantity: number, currentStock: number) {
  if (!quantity) return '0';
  if (type === 'IN') return `+${quantity}`;
  if (type === 'OUT') return `-${quantity}`;
  const difference = quantity - currentStock;
  if (difference === 0) return '0';
  return difference > 0 ? `+${difference}` : String(difference);
}

export function AdjustStockModal({ product, onSubmit, onClose }: AdjustStockModalProps) {
  const [type, setType] = useState<InventoryMovementType>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const numericQuantity = Number(quantity || 0);
  const resultingStock = useMemo(
    () => resolveResultingStock(product.stock, type, numericQuantity),
    [numericQuantity, product.stock, type],
  );
  const isOutOverStock = type === 'OUT' && numericQuantity > product.stock;
  const isReasonInvalid = reason.trim().length > 0 && reason.trim().length < 5;
  const canSubmit = numericQuantity > 0 && reason.trim().length >= 5 && !isOutOverStock && !isSaving;
  const selectedOption = movementOptions.find((option) => option.type === type) ?? movementOptions[0];
  const SubmitIcon = selectedOption.icon;

  const handleQuantityChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setQuantity(cleanValue);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (numericQuantity <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }

    if (reason.trim().length < 5) {
      setError('El motivo es obligatorio y debe tener al menos 5 caracteres.');
      return;
    }

    if (isOutOverStock) {
      setError('No puedes retirar más unidades que el stock disponible.');
      return;
    }

    try {
      setIsSaving(true);
      await onSubmit({ type, quantity: numericQuantity, reason: reason.trim() });
    } catch {
      setError('No se pudo actualizar el stock. Intenta nuevamente.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
              <PackageCheck size={14} />
              Inventario
            </div>
            <h2 className="mt-3 text-xl font-black text-slate-950">Ajustar stock</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Actualiza el inventario registrando el motivo del movimiento.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Producto</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-slate-950">{product.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">SKU: {product.sku}</p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1.5 text-sm font-black text-brand-blue shadow-sm">
                Stock actual: {product.stock}
              </span>
            </div>
          </section>

          <section>
            <p className="text-sm font-black text-slate-950">Tipo de movimiento</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {movementOptions.map((option) => {
                const Icon = option.icon;
                const isActive = type === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => {
                      setType(option.type);
                      setError('');
                    }}
                    className={`rounded-2xl border p-3 text-left transition ${option.tone} ${isActive ? option.activeTone : 'hover:-translate-y-0.5 hover:shadow-sm'}`}
                  >
                    <Icon size={20} />
                    <p className="mt-2 text-sm font-black">{option.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 opacity-80">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[1fr_18rem]">
            <div>
              <label className="text-sm font-black text-slate-950" htmlFor="stock-quantity">
                {type === 'ADJUSTMENT' ? 'Stock final corregido' : 'Cantidad a ajustar'}
              </label>
              <input
                id="stock-quantity"
                type="text"
                inputMode="numeric"
                value={quantity}
                onFocus={() => {
                  if (quantity === '0') setQuantity('');
                }}
                onChange={(event) => handleQuantityChange(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-base font-bold text-slate-900 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                placeholder={type === 'ADJUSTMENT' ? 'Ej. 12' : 'Ej. 3'}
                required
              />
              <p className="mt-2 text-xs font-semibold text-slate-500">
                {type === 'ADJUSTMENT' ? 'Ingresa el stock final según conteo físico.' : 'Ingresa la cantidad de unidades.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Vista previa</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex justify-between"><span>Stock actual</span><strong className="text-slate-950">{product.stock}</strong></div>
                <div className="flex justify-between"><span>Movimiento</span><strong className={type === 'OUT' ? 'text-orange-600' : 'text-emerald-600'}>{movementLabel(type, numericQuantity, product.stock)}</strong></div>
                <div className="flex justify-between border-t border-slate-100 pt-2"><span>Stock resultante</span><strong className={resultingStock < 0 ? 'text-red-600' : 'text-brand-blue'}>{resultingStock}</strong></div>
              </div>
            </div>
          </section>

          {isOutOverStock ? (
            <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              La salida no puede superar el stock disponible.
            </div>
          ) : null}

          <section>
            <label className="text-sm font-black text-slate-950" htmlFor="stock-reason">Motivo del ajuste</label>
            <textarea
              id="stock-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 180))}
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              placeholder="Ejemplo: reposición, conteo físico, producto dañado, devolución, corrección de inventario..."
              required
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold">
              <span className={isReasonInvalid ? 'text-red-600' : 'text-slate-500'}>Mínimo 5 caracteres.</span>
              <span className="text-slate-400">{reason.length}/180</span>
            </div>
          </section>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" disabled={!canSubmit} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-violet px-5 text-sm font-black text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            <SubmitIcon size={18} />
            {type === 'IN' ? 'Registrar entrada' : type === 'OUT' ? 'Registrar salida' : 'Registrar corrección'}
          </button>
        </footer>
      </motion.form>
    </div>
  );
}

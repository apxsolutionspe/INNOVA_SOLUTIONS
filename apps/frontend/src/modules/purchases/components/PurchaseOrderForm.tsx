import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

import { inventoryService } from '../../inventory/services/inventory.service';
import { Product } from '../../inventory/types/inventory.types';
import { suppliersService } from '../../suppliers/services/suppliers.service';
import { Supplier } from '../../suppliers/types/supplier.types';
import { calculatePurchasePreview } from '../utils/purchase-calculations';
import { PaymentMethod, PurchasePayload, PurchasePaymentStatus } from '../types/purchase.types';

interface Props {
  onSubmit: (payload: PurchasePayload) => Promise<void>;
  onClose: () => void;
}

interface DraftItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

export function PurchaseOrderForm({ onSubmit, onClose }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>('PENDING');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [payFromCash, setPayFromCash] = useState(false);
  const [reference, setReference] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void suppliersService.findAll({ limit: 100 }).then((response) => setSuppliers(response.items));
    void inventoryService.findProducts({ limit: 100 }).then((response) => setProducts(response.items));
  }, []);

  const totals = useMemo(() => calculatePurchasePreview(items, discount), [discount, items]);

  const addItem = () => {
    const product = products[0];
    if (!product) return;
    setItems((current) => [...current, { productId: product.id, quantity: 1, unitCost: product.purchasePrice }]);
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({
      supplierId,
      items,
      discount,
      paymentStatus,
      paymentMethod: paymentStatus === 'PENDING' ? undefined : paymentMethod,
      reference,
      expectedDate: expectedDate || undefined,
      payFromCash,
      notes,
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 sm:p-4">
      <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Nueva orden de compra</h2>
            <p className="text-sm text-slate-500">El backend recalcula importes y controla stock al recibir.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cerrar</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="grid min-w-0 gap-4 md:grid-cols-3">
          <select required value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue">
            <option value="">Seleccionar proveedor</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
          <input type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input type="number" min={0} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} placeholder="Descuento" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
        </div>

        <div className="mt-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-950">Productos</h3>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"><Plus size={17} /> Agregar producto</button>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const product = products.find((candidate) => candidate.id === item.productId);
              return (
                <div key={`${item.productId}-${index}`} className="grid gap-3 p-4 md:grid-cols-[1fr_120px_140px_44px]">
                  <div>
                    <select value={item.productId} onChange={(event) => {
                      const nextProduct = products.find((candidate) => candidate.id === event.target.value);
                      updateItem(index, { productId: event.target.value, unitCost: nextProduct?.purchasePrice ?? item.unitCost });
                    }} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue">
                      {products.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} - Stock {candidate.stock}/{candidate.minStock}</option>)}
                    </select>
                    {product && product.stock <= product.minStock ? <p className="mt-1 text-xs font-semibold text-orange-600">Producto en stock bajo.</p> : null}
                  </div>
                  <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
                  <input type="number" min={0} step="0.01" value={item.unitCost} onChange={(event) => updateItem(index, { unitCost: Number(event.target.value) })} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
                  <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="grid h-11 place-items-center rounded-lg text-red-600 hover:bg-red-50" title="Quitar"><Trash2 size={18} /></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PurchasePaymentStatus)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue">
            <option value="PENDING">Pago pendiente</option>
            <option value="PARTIAL">Pago parcial</option>
            <option value="PAID">Pagada</option>
          </select>
          <select disabled={paymentStatus === 'PENDING'} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue disabled:bg-slate-100">
            <option value="CASH">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Referencia" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={payFromCash} onChange={(event) => setPayFromCash(event.target.checked)} />
            Registrar en caja
          </label>
        </div>

        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas administrativas" className="mt-4 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue" />
        <div className="mt-5 flex flex-col gap-3 rounded-lg bg-slate-950 p-4 text-white md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-300">Subtotal S/ {totals.subtotal.toFixed(2)} | IGV S/ {totals.taxTotal.toFixed(2)}</div>
          <div className="text-2xl font-bold">Total S/ {totals.total.toFixed(2)}</div>
        </div>
        <button disabled={isSaving || !items.length} type="submit" className="mt-5 min-h-11 w-full rounded-lg bg-brand-blue text-sm font-bold text-white disabled:opacity-60">
          {isSaving ? 'Registrando...' : 'Registrar compra'}
        </button>
        </div>
      </motion.form>
    </div>
  );
}

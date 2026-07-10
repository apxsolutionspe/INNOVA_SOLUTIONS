import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarDays, PackagePlus, ReceiptText, Trash2, Truck, X } from 'lucide-react';

import { suppliersService } from '../../suppliers/services/suppliers.service';
import { Supplier, SupplierProduct } from '../../suppliers/types/supplier.types';
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

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function resolveUnitCost(item: SupplierProduct) {
  return Number(item.lastCost ?? item.referencePrice ?? item.product?.purchasePrice ?? 0);
}

export function PurchaseOrderForm({ onSubmit, onClose }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalog, setCatalog] = useState<SupplierProduct[]>([]);
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
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void suppliersService.findAll({ limit: 100, isActive: true }).then((response) => setSuppliers(response.items));
  }, []);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  );

  const supplierCatalog = useMemo(
    () =>
      catalog
        .filter((item) => item.isActive && item.productId && item.product?.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [catalog],
  );

  const totals = useMemo(() => calculatePurchasePreview(items, discount), [discount, items]);

  const handleSupplierChange = (nextSupplierId: string) => {
    setSupplierId(nextSupplierId);
    setItems([]);
    setError('');
    setCatalog([]);
    if (!nextSupplierId) return;

    setIsLoadingCatalog(true);
    void suppliersService.products(nextSupplierId)
      .then((products) => setCatalog(products))
      .catch(() => {
        setCatalog([]);
        setError('No se pudo cargar el catálogo del proveedor seleccionado.');
      })
      .finally(() => setIsLoadingCatalog(false));
  };

  const findCatalogItem = (productId: string) => supplierCatalog.find((item) => item.productId === productId);

  const addItem = () => {
    setError('');
    if (!supplierId) {
      setError('Selecciona un proveedor.');
      return;
    }

    const candidate = supplierCatalog.find((item) => !items.some((current) => current.productId === item.productId));
    if (!candidate?.productId) {
      setError(supplierCatalog.length ? 'Todos los productos disponibles ya fueron agregados.' : 'Este proveedor aún no tiene productos asignados.');
      return;
    }

    setItems((current) => [
      ...current,
      {
        productId: candidate.productId as string,
        quantity: 1,
        unitCost: resolveUnitCost(candidate),
      },
    ]);
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setError('');
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, ...patch };
        if (patch.productId) {
          const catalogItem = findCatalogItem(patch.productId);
          next.unitCost = catalogItem ? resolveUnitCost(catalogItem) : item.unitCost;
        }
        return next;
      }),
    );
  };

  const validate = () => {
    if (!supplierId) return 'Selecciona un proveedor.';
    if (!items.length) return 'Agrega al menos un producto.';
    const allowedProductIds = new Set(supplierCatalog.map((item) => item.productId));

    for (const item of items) {
      if (!allowedProductIds.has(item.productId)) return 'Este producto no pertenece al catálogo del proveedor seleccionado.';
      if (item.quantity <= 0) return 'La cantidad debe ser mayor a cero.';
      if (item.unitCost < 0) return 'El costo unitario no puede ser negativo.';
    }

    if (payFromCash && paymentStatus !== 'PAID') return 'Para registrar en caja, la compra debe estar pagada.';
    if (payFromCash && !paymentMethod) return 'Selecciona un método de pago para registrar en caja.';
    return '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await onSubmit({
        supplierId,
        items,
        discount,
        paymentStatus,
        paymentMethod: paymentStatus === 'PENDING' ? undefined : paymentMethod,
        reference: reference.trim() || undefined,
        expectedDate: expectedDate || undefined,
        payFromCash,
        notes: notes.trim() || undefined,
      });
    } catch {
      setError('No se pudo registrar la compra. Revisa los datos e intenta nuevamente.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-brand-blue">
              <Truck size={14} />
              Abastecimiento
            </div>
            <h2 className="mt-3 text-xl font-black text-slate-950">Nueva orden de compra</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Registra productos adquiridos a un proveedor y actualiza inventario al recibir.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-black text-slate-950">Datos principales</h3>
            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(16rem,1fr)_13rem_13rem]">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Proveedor</span>
                <select required value={supplierId} onChange={(event) => handleSupplierChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100">
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Fecha estimada</span>
                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Descuento</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">S/</span>
                  <input type="number" min={0} step="0.01" value={discount} onChange={(event) => setDiscount(Math.max(Number(event.target.value), 0))} placeholder="0.00" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                </div>
                <span className="mt-1 block text-xs font-semibold text-slate-400">Opcional</span>
              </label>
            </div>

            {selectedSupplier ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                {isLoadingCatalog ? (
                  'Cargando catálogo del proveedor...'
                ) : (
                  <>
                    Catálogo disponible: <strong className="text-slate-950">{supplierCatalog.length}</strong> productos vinculados a {selectedSupplier.name}.
                  </>
                )}
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-slate-950">Productos del proveedor</h3>
                <p className="mt-1 text-sm text-slate-500">Una orden de compra se registra para un solo proveedor.</p>
              </div>
              <button type="button" onClick={addItem} disabled={isLoadingCatalog} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                <PackagePlus size={17} />
                Agregar producto del proveedor
              </button>
            </div>

            {!supplierId ? (
              <div className="p-6 text-center">
                <ReceiptText className="mx-auto text-slate-300" size={34} />
                <p className="mt-3 text-sm font-black text-slate-700">Selecciona un proveedor para ver su catálogo.</p>
              </div>
            ) : isLoadingCatalog ? (
              <div className="p-6 text-center">
                <PackagePlus className="mx-auto animate-pulse text-blue-300" size={34} />
                <p className="mt-3 text-sm font-black text-slate-700">Cargando productos vinculados...</p>
              </div>
            ) : supplierCatalog.length === 0 ? (
              <div className="p-6 text-center">
                <AlertTriangle className="mx-auto text-orange-400" size={34} />
                <p className="mt-3 text-sm font-black text-slate-800">Este proveedor aún no tiene productos asignados.</p>
                <p className="mt-1 text-sm text-slate-500">Asigna productos desde el módulo Proveedores antes de registrar la compra.</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center">
                <PackagePlus className="mx-auto text-slate-300" size={34} />
                <p className="mt-3 text-sm font-black text-slate-700">Agrega productos del catálogo del proveedor.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const catalogItem = findCatalogItem(item.productId);
                  const product = catalogItem?.product;
                  const subtotal = item.quantity * item.unitCost;
                  const availableOptions = supplierCatalog.filter(
                    (candidate) => candidate.productId === item.productId || !items.some((current, currentIndex) => currentIndex !== index && current.productId === candidate.productId),
                  );

                  return (
                    <div key={`${item.productId}-${index}`} className="grid gap-3 p-4 lg:grid-cols-[minmax(16rem,1fr)_8rem_10rem_8rem_44px] lg:items-start">
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Producto</span>
                        <select value={item.productId} onChange={(event) => updateItem(index, { productId: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue">
                          {availableOptions.map((candidate) => (
                            <option key={candidate.id} value={candidate.productId ?? ''}>
                              {candidate.product?.name ?? candidate.name}
                            </option>
                          ))}
                        </select>
                        {product ? (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {product.category?.name ?? catalogItem?.category ?? 'Sin categoría'} · Stock {product.stock}/{product.minStock}
                          </p>
                        ) : null}
                        {product && product.stock <= product.minStock ? <p className="mt-1 text-xs font-bold text-orange-600">Producto en stock bajo.</p> : null}
                      </label>
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Cantidad</span>
                        <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(Number(event.target.value), 1) })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue" />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Costo unitario</span>
                        <input type="number" min={0} step="0.01" value={item.unitCost} onChange={(event) => updateItem(index, { unitCost: Math.max(Number(event.target.value), 0) })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue" />
                        {catalogItem?.lastCost || catalogItem?.referencePrice ? <span className="mt-1 block text-xs font-semibold text-slate-400">Referencial: {formatMoney(Number(catalogItem.lastCost ?? catalogItem.referencePrice ?? 0))}</span> : null}
                      </label>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Subtotal</span>
                        <p className="mt-4 text-sm font-black text-slate-950">{formatMoney(subtotal)}</p>
                      </div>
                      <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mt-6 grid h-11 place-items-center rounded-xl text-red-600 transition hover:bg-red-50" title="Quitar producto">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-black text-slate-950">Pago y referencia</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Estado de pago</span>
                  <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PurchasePaymentStatus)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue">
                    <option value="PENDING">Pago pendiente</option>
                    <option value="PARTIAL">Pago parcial</option>
                    <option value="PAID">Pagada</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Método de pago</span>
                  <select disabled={paymentStatus === 'PENDING'} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue disabled:bg-slate-100">
                    <option value="CASH">Efectivo</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Referencia o comprobante</span>
                  <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="N.º factura, guía, transferencia u observación de pago" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue" />
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={payFromCash} onChange={(event) => setPayFromCash(event.target.checked)} />
                  Registrar pago en caja
                </label>
              </div>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas administrativas" className="mt-4 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-blue" />
            </div>

            <aside className="rounded-2xl bg-slate-950 p-4 text-white">
              <h3 className="text-sm font-black">Resumen de compra</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-300">
                <div className="flex justify-between"><span>Subtotal</span><strong className="text-white">{formatMoney(totals.subtotal)}</strong></div>
                <div className="flex justify-between"><span>Descuento</span><strong className="text-white">{formatMoney(discount)}</strong></div>
                <div className="flex justify-between"><span>IGV</span><strong className="text-white">{formatMoney(totals.taxTotal)}</strong></div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base"><span>Total</span><strong className="text-2xl text-white">{formatMoney(totals.total)}</strong></div>
              </div>
            </aside>
          </section>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            Cancelar
          </button>
          <button disabled={isSaving || isLoadingCatalog || !items.length} type="submit" className="h-11 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Registrando...' : 'Registrar compra'}
          </button>
        </footer>
      </motion.form>
    </div>
  );
}

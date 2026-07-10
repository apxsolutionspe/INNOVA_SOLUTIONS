import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Filter,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';

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
  return `S/ ${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function productName(item: SupplierProduct) {
  return item.product?.name ?? item.name;
}

function productCategory(item: SupplierProduct) {
  return item.product?.category?.name ?? item.category ?? 'Sin categoría';
}

function productUnit(item: SupplierProduct) {
  return item.product?.unit ?? item.unit ?? 'unidad';
}

function productSku(item: SupplierProduct) {
  return item.product?.sku ?? item.supplierSku ?? 'Sin SKU';
}

function resolveUnitCost(item?: SupplierProduct) {
  return Number(item?.lastCost ?? item?.referencePrice ?? item?.product?.purchasePrice ?? 0);
}

function resolveLeadTime(item: SupplierProduct) {
  return item.leadTime ?? item.deliveryTime ?? 'Por confirmar';
}

export function PurchaseOrderForm({ onSubmit, onClose }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalog, setCatalog] = useState<SupplierProduct[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
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
        .sort((a, b) => productName(a).localeCompare(productName(b))),
    [catalog],
  );

  const categoryOptions = useMemo(() => {
    const categories = new Set(supplierCatalog.map(productCategory).filter(Boolean));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [supplierCatalog]);

  const filteredCatalog = useMemo(() => {
    const query = normalizeSearch(catalogSearch);
    return supplierCatalog.filter((item) => {
      const matchesCategory = categoryFilter === 'ALL' || productCategory(item) === categoryFilter;
      if (!matchesCategory) return false;
      if (!query) return true;

      const searchable = normalizeSearch([
        productName(item),
        productCategory(item),
        productSku(item),
        item.availability ?? '',
        item.notes ?? '',
      ].join(' '));
      return searchable.includes(query);
    });
  }, [catalogSearch, categoryFilter, supplierCatalog]);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        unitCost: Number.isFinite(item.unitCost) && item.unitCost >= 0 ? item.unitCost : resolveUnitCost(findCatalogItemFromList(supplierCatalog, item.productId)),
      })),
    [items, supplierCatalog],
  );

  const totals = useMemo(() => calculatePurchasePreview(normalizedItems, discount), [discount, normalizedItems]);

  const addedProductIds = useMemo(() => new Set(items.map((item) => item.productId)), [items]);

  const handleSupplierChange = (nextSupplierId: string) => {
    setSupplierId(nextSupplierId);
    setItems([]);
    setCatalog([]);
    setCatalogSearch('');
    setCategoryFilter('ALL');
    setError('');
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

  const findCatalogItem = (productId: string) => findCatalogItemFromList(supplierCatalog, productId);

  const addCatalogProduct = (product: SupplierProduct) => {
    setError('');
    if (!product.productId) return;
    if (addedProductIds.has(product.productId)) {
      setError('Este producto ya fue agregado a la orden.');
      return;
    }

    setItems((current) => [
      ...current,
      {
        productId: product.productId as string,
        quantity: 1,
        unitCost: resolveUnitCost(product),
      },
    ]);
  };

  const handleCatalogAction = () => {
    if (!supplierId) {
      setError('Selecciona un proveedor para ver su catálogo.');
      return;
    }
    if (!supplierCatalog.length) {
      setError('Este proveedor aún no tiene productos vinculados.');
      return;
    }
    setError('');
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setError('');
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const normalizeItem = (index: number) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const catalogItem = findCatalogItem(item.productId);
        return {
          ...item,
          quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
          unitCost: Number.isFinite(item.unitCost) && item.unitCost >= 0 ? item.unitCost : resolveUnitCost(catalogItem),
        };
      }),
    );
  };

  const validate = () => {
    if (!supplierId) return 'Selecciona un proveedor.';
    if (!normalizedItems.length) return 'Agrega al menos un producto del proveedor para registrar la compra.';
    const allowedProductIds = new Set(supplierCatalog.map((item) => item.productId));
    const seenProductIds = new Set<string>();

    for (const item of normalizedItems) {
      if (!item.productId) return 'Cada producto debe tener un identificador válido.';
      if (seenProductIds.has(item.productId)) return 'No se permiten productos duplicados en la orden.';
      seenProductIds.add(item.productId);
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
        items: normalizedItems,
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
              Elige productos del catálogo del proveedor y registra la compra para abastecimiento.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label="Cerrar formulario">
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
                <p className="mt-1 text-sm text-slate-500">Elige productos del catálogo vinculado a este proveedor.</p>
              </div>
              <button type="button" onClick={handleCatalogAction} disabled={isLoadingCatalog} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                <PackagePlus size={17} />
                Ver catálogo del proveedor
              </button>
            </div>

            {!supplierId ? (
              <EmptyCatalogState icon="receipt" title="Selecciona un proveedor" description="Al seleccionar un proveedor se mostrará su catálogo de productos vinculados." />
            ) : isLoadingCatalog ? (
              <EmptyCatalogState icon="loading" title="Cargando productos vinculados..." description="Estamos consultando el catálogo del proveedor seleccionado." />
            ) : supplierCatalog.length === 0 ? (
              <EmptyCatalogState icon="warning" title="Este proveedor aún no tiene productos asignados." description="Asigna productos desde el módulo Proveedores antes de registrar la compra." />
            ) : (
              <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(25rem,0.85fr)]">
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h4 className="font-black text-slate-950">Catálogo disponible</h4>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{filteredCatalog.length} de {supplierCatalog.length} productos disponibles</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_12rem]">
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Buscar</span>
                        <div className="relative mt-2">
                          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                          <input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Buscar producto del proveedor..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Categoría</span>
                        <div className="relative mt-2">
                          <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100">
                            <option value="ALL">Todas las categorías</option>
                            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </div>
                      </label>
                    </div>
                  </div>

                  {filteredCatalog.length ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {filteredCatalog.map((product) => {
                        const isAdded = Boolean(product.productId && addedProductIds.has(product.productId));
                        return (
                          <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h5 className="break-words text-sm font-black text-slate-950">{productName(product)}</h5>
                                <p className="mt-1 text-xs font-bold text-slate-500">{productCategory(product)} · SKU {productSku(product)}</p>
                              </div>
                              {isAdded ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                                  <CheckCircle2 size={13} />
                                  Agregado
                                </span>
                              ) : null}
                            </div>

                            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-black uppercase text-slate-400">Stock actual</dt>
                                <dd className="font-bold text-slate-800">{product.product?.stock ?? 0} {productUnit(product)}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-black uppercase text-slate-400">Costo referencial</dt>
                                <dd className="font-bold text-slate-800">{formatMoney(resolveUnitCost(product))}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-black uppercase text-slate-400">Entrega</dt>
                                <dd className="font-bold text-slate-800">{resolveLeadTime(product)}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-black uppercase text-slate-400">Disponibilidad</dt>
                                <dd className="font-bold text-slate-800">{product.availability ?? 'Disponible'}</dd>
                              </div>
                            </dl>

                            {product.notes ? <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">{product.notes}</p> : null}

                            <button
                              type="button"
                              onClick={() => addCatalogProduct(product)}
                              disabled={isAdded}
                              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                            >
                              {isAdded ? 'Ya agregado' : 'Agregar'}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                      <Search className="mx-auto text-slate-300" size={34} />
                      <p className="mt-3 text-sm font-black text-slate-700">No se encontraron productos con ese criterio.</p>
                    </div>
                  )}
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 p-4">
                    <h4 className="font-black text-slate-950">Productos agregados a la orden</h4>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{items.length} producto(s) seleccionados</p>
                  </div>

                  {items.length ? (
                    <div className="divide-y divide-slate-100">
                      {items.map((item, index) => {
                        const catalogItem = findCatalogItem(item.productId);
                        const product = catalogItem?.product;
                        const subtotal = normalizedItems[index].quantity * normalizedItems[index].unitCost;

                        return (
                          <div key={`${item.productId}-${index}`} className="grid gap-3 p-4 lg:grid-cols-[minmax(12rem,1fr)_6rem_8rem_7rem_40px] lg:items-start">
                            <div className="min-w-0">
                              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Producto</span>
                              <p className="mt-2 break-words text-sm font-black text-slate-950">{catalogItem ? productName(catalogItem) : 'Producto no disponible'}</p>
                              {product ? (
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {product.category?.name ?? catalogItem?.category ?? 'Sin categoría'} · Stock actual: {product.stock}
                                </p>
                              ) : null}
                            </div>
                            <label className="block">
                              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Cantidad</span>
                              <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(Number(event.target.value), 1) })} onBlur={() => normalizeItem(index)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue" />
                            </label>
                            <label className="block">
                              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Costo unitario</span>
                              <input type="number" min={0} step="0.01" value={item.unitCost} onChange={(event) => updateItem(index, { unitCost: Math.max(Number(event.target.value), 0) })} onBlur={() => normalizeItem(index)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-blue" />
                              {catalogItem?.lastCost || catalogItem?.referencePrice ? <span className="mt-1 block text-xs font-semibold text-slate-400">Ref.: {formatMoney(resolveUnitCost(catalogItem))}</span> : null}
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
                  ) : (
                    <div className="p-6 text-center">
                      <PackageCheck className="mx-auto text-slate-300" size={34} />
                      <p className="mt-3 text-sm font-black text-slate-700">Aún no agregaste productos a la orden.</p>
                      <p className="mt-1 text-sm text-slate-500">Usa el botón Agregar en el catálogo disponible.</p>
                    </div>
                  )}
                </div>
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
          <button disabled={isSaving || isLoadingCatalog || !normalizedItems.length} type="submit" className="h-11 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Registrando...' : 'Registrar compra'}
          </button>
        </footer>
      </motion.form>
    </div>
  );
}

function findCatalogItemFromList(items: SupplierProduct[], productId: string) {
  return items.find((item) => item.productId === productId);
}

function EmptyCatalogState({ icon, title, description }: { icon: 'receipt' | 'loading' | 'warning'; title: string; description: string }) {
  const Icon = icon === 'warning' ? AlertTriangle : icon === 'loading' ? PackagePlus : ReceiptText;
  const color = icon === 'warning' ? 'text-orange-400' : icon === 'loading' ? 'animate-pulse text-blue-300' : 'text-slate-300';

  return (
    <div className="p-6 text-center">
      <Icon className={`mx-auto ${color}`} size={34} />
      <p className="mt-3 text-sm font-black text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

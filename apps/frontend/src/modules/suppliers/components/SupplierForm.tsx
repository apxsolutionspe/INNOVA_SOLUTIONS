import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Edit3, MapPin, PackagePlus, Search, Trash2, UserRound, X, type LucideIcon } from 'lucide-react';

import { documentLookupService } from '../../../services/documentLookupService';
import { inventoryService } from '../../inventory/services/inventory.service';
import type { Product } from '../../inventory/types/inventory.types';
import { Supplier, SupplierPayload, SupplierProductPayload } from '../types/supplier.types';

interface Props {
  supplier?: Supplier | null;
  onSubmit: (payload: SupplierPayload) => Promise<void>;
  onClose: () => void;
}

type CatalogDraft = SupplierProductPayload & {
  localId: string;
};

type FieldErrors = Partial<Record<keyof SupplierPayload | 'catalog', string>>;

const categoryOptions = ['Accesorios', 'Componentes', 'Computadoras', 'Impresión', 'Laptops', 'Periféricos', 'Redes', 'Software', 'Repuestos', 'Seguridad', 'Otros'];
const unitOptions = ['unidad', 'caja', 'paquete', 'licencia', 'botella', 'cartucho', 'metro', 'rollo', 'servicio'];
const availabilityOptions = ['Disponible', 'Bajo pedido', 'Consultar stock', 'Temporalmente no disponible'];

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyProduct(): CatalogDraft {
  return {
    localId: createId(),
    productId: '',
    name: '',
    category: '',
    unit: 'unidad',
    supplierSku: '',
    referencePrice: undefined,
    minOrderQuantity: 1,
    deliveryTime: '',
    availability: 'Disponible',
    notes: '',
    isPreferred: false,
    isActive: true,
  };
}

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizePhone(value?: string) {
  const clean = digits(value ?? '');
  if (!clean) return '';
  return clean.startsWith('51') ? clean : clean.length === 9 ? `51${clean}` : clean;
}

function normalizeText(value?: string) {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

function validateSupplier(form: SupplierPayload, catalog: CatalogDraft[]) {
  const errors: FieldErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = 'El nombre del proveedor es obligatorio.';
  if (form.ruc && !/^\d{11}$/.test(digits(form.ruc))) errors.ruc = 'Ingresa un RUC válido de 11 dígitos.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'El correo no tiene un formato válido.';
  const phone = digits(form.phone ?? '');
  if (phone && !/^(\d{9}|51\d{9})$/.test(phone)) errors.phone = 'Ingresa un teléfono válido para Perú.';
  const whatsapp = digits(form.whatsapp ?? '');
  if (whatsapp && !/^(\d{9}|51\d{9})$/.test(whatsapp)) errors.whatsapp = 'Ingresa un WhatsApp válido para Perú.';

  const productIds = new Set<string>();
  const offeredNames = new Set<string>();
  for (const item of catalog.filter((product) => product.productId || normalizeText(product.name))) {
    if (!item.productId && !normalizeText(item.name)) {
      errors.catalog = 'Debes vincular un producto del inventario o escribir el nombre del producto ofrecido.';
      break;
    }
    if (!normalizeText(item.category)) {
      errors.catalog = 'La categoría es obligatoria en el catálogo del proveedor.';
      break;
    }
    if (!normalizeText(item.unit)) {
      errors.catalog = 'La unidad de compra es obligatoria.';
      break;
    }
    if ((item.referencePrice ?? 0) < 0) {
      errors.catalog = 'El costo referencial no puede ser negativo.';
      break;
    }
    if ((item.minOrderQuantity ?? 1) <= 0) {
      errors.catalog = 'La cantidad mínima debe ser mayor a cero.';
      break;
    }
    if (item.productId) {
      if (productIds.has(item.productId)) {
        errors.catalog = 'Este producto ya está asignado a este proveedor.';
        break;
      }
      productIds.add(item.productId);
    } else {
      const key = normalizeText(item.name).toLowerCase();
      if (offeredNames.has(key)) {
        errors.catalog = 'Este producto ofrecido ya está asignado a este proveedor.';
        break;
      }
      offeredNames.add(key);
    }
  }

  return errors;
}

function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
        <Icon size={18} />
      </span>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="text-xs font-semibold text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function money(value?: number | null) {
  const amount = Number(value ?? 0);
  return `S/ ${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

export function SupplierForm({ supplier, onSubmit, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<SupplierPayload>({
    name: supplier?.name ?? '',
    ruc: supplier?.ruc ?? '',
    phone: supplier?.phone ?? '',
    whatsapp: supplier?.whatsapp ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    department: supplier?.department ?? '',
    province: supplier?.province ?? '',
    district: supplier?.district ?? '',
    reference: supplier?.reference ?? '',
    contactName: supplier?.contactName ?? '',
    contactRole: supplier?.contactRole ?? '',
    sunatStatus: supplier?.sunatStatus ?? '',
    sunatCondition: supplier?.sunatCondition ?? '',
    notes: supplier?.notes ?? '',
  });
  const [catalog, setCatalog] = useState<CatalogDraft[]>(
    (supplier?.products ?? []).map((item) => ({
      localId: item.id,
      productId: item.productId ?? '',
      name: item.name,
      category: item.category ?? item.product?.category?.name ?? '',
      unit: item.unit ?? item.product?.unit ?? 'unidad',
      supplierSku: item.supplierSku ?? '',
      referencePrice: item.referencePrice ?? undefined,
      minOrderQuantity: item.minOrderQuantity ?? 1,
      deliveryTime: item.deliveryTime ?? '',
      availability: item.availability ?? 'Disponible',
      notes: item.notes ?? '',
      isPreferred: item.isPreferred ?? false,
      isActive: item.isActive,
    })),
  );
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void inventoryService.findProducts({ page: 1, limit: 200 }).then((response) => setProducts(response.items)).catch(() => setProducts([]));
  }, []);

  const activeCatalog = useMemo(
    () => catalog.filter((item) => item.productId || normalizeText(item.name)),
    [catalog],
  );
  const editingCatalog = catalog.find((item) => item.localId === editingCatalogId) ?? null;

  const update = (key: keyof SupplierPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const updateCatalog = (localId: string, patch: Partial<CatalogDraft>) => {
    setCatalog((current) => current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
    setErrors((current) => ({ ...current, catalog: undefined }));
  };

  const addCatalogItem = () => {
    const draft = emptyProduct();
    setCatalog((current) => [...current, draft]);
    setEditingCatalogId(draft.localId);
    setErrors((current) => ({ ...current, catalog: undefined }));
  };

  const selectProduct = (localId: string, productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      updateCatalog(localId, { productId: '', name: '', category: '', unit: 'unidad', referencePrice: undefined });
      return;
    }
    updateCatalog(localId, {
      productId: product.id,
      name: product.name,
      category: product.category?.name ?? '',
      unit: product.unit,
      referencePrice: product.purchasePrice,
    });
  };

  const lookupRuc = async () => {
    const ruc = digits(form.ruc ?? '');
    setLookupMessage('');
    setLookupStatus('idle');
    if (!/^\d{11}$/.test(ruc)) {
      setLookupStatus('warning');
      setLookupMessage('Ingresa un RUC válido de 11 dígitos.');
      return;
    }
    setIsLookingUp(true);
    try {
      const result = await documentLookupService.lookupRuc(ruc);
      if (!result.success || !result.data) {
        setLookupStatus('warning');
        setLookupMessage(result.message ?? 'No se encontró información para este RUC.');
        return;
      }
      const data = result.data;
      setForm((current) => ({
        ...current,
        ruc: data.ruc,
        name: data.businessName || current.name,
        address: data.fullAddress ?? data.address ?? current.address,
        department: data.department ?? current.department,
        province: data.province ?? current.province,
        district: data.district ?? current.district,
        sunatStatus: data.status ?? current.sunatStatus,
        sunatCondition: data.condition ?? current.sunatCondition,
      }));
      setLookupStatus('success');
      setLookupMessage('Datos del RUC encontrados correctamente.');
    } catch (error) {
      setLookupStatus('error');
      setLookupMessage(error instanceof Error ? error.message : 'No se pudo consultar el RUC. Puedes registrar los datos manualmente.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: SupplierPayload = {
      ...form,
      ruc: digits(form.ruc ?? ''),
      phone: normalizePhone(form.phone),
      whatsapp: normalizePhone(form.whatsapp),
      products: activeCatalog.map(({ localId: _localId, ...item }) => ({
        ...item,
        productId: item.productId || undefined,
        name: normalizeText(item.name),
        category: normalizeText(item.category),
        unit: normalizeText(item.unit),
        supplierSku: normalizeText(item.supplierSku),
        deliveryTime: normalizeText(item.deliveryTime),
        availability: normalizeText(item.availability),
        notes: normalizeText(item.notes),
        minOrderQuantity: Math.max(Number(item.minOrderQuantity ?? 1), 1),
        referencePrice: item.referencePrice === undefined || item.referencePrice === null ? undefined : Number(item.referencePrice),
      })),
    };
    const nextErrors = validateSupplier(payload, activeCatalog);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 px-0 py-0 backdrop-blur-sm sm:place-items-center sm:px-4 sm:py-6">
      <motion.form
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="flex max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 px-5 py-5 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Gestión de abastecimiento</p>
            <h2 className="mt-1 text-2xl font-black">{supplier ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <p className="mt-1 text-sm text-slate-300">Registra datos comerciales, contacto y productos ofrecidos.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 text-white transition hover:bg-white/10">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50 px-5 py-5 sm:px-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={Building2} title="Identificación del proveedor" description="Consulta el RUC y completa los datos comerciales." />
            <div className="grid gap-4 lg:grid-cols-[1fr_170px_2fr_1fr_1fr]">
              <label>
                <span className="text-xs font-black uppercase text-slate-400">RUC</span>
                <input value={form.ruc ?? ''} onChange={(event) => update('ruc', digits(event.target.value).slice(0, 11))} placeholder="20123456789" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                {errors.ruc ? <p className="mt-1 text-xs font-bold text-red-600">{errors.ruc}</p> : null}
              </label>
              <button type="button" onClick={() => void lookupRuc()} disabled={isLookingUp} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                <Search size={16} />
                {isLookingUp ? 'Consultando...' : 'Consultar RUC'}
              </button>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Razón social / Nombre</span>
                <input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nombre del proveedor" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                {errors.name ? <p className="mt-1 text-xs font-bold text-red-600">{errors.name}</p> : null}
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Estado SUNAT</span>
                <input value={form.sunatStatus ?? ''} onChange={(event) => update('sunatStatus', event.target.value)} placeholder="Activo" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Condición SUNAT</span>
                <input value={form.sunatCondition ?? ''} onChange={(event) => update('sunatCondition', event.target.value)} placeholder="Habido" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
            {lookupMessage ? (
              <p className={`rounded-xl px-3 py-2 text-sm font-bold ${lookupStatus === 'success' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : lookupStatus === 'warning' ? 'border border-orange-200 bg-orange-50 text-orange-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
                {lookupMessage}
              </p>
            ) : null}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={UserRound} title="Contacto comercial" description="Información para coordinación de compras y entregas." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label><span className="text-xs font-black uppercase text-slate-400">Teléfono</span><input value={form.phone ?? ''} onChange={(event) => update('phone', event.target.value)} placeholder="991234567" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />{errors.phone ? <p className="mt-1 text-xs font-bold text-red-600">{errors.phone}</p> : null}</label>
              <label><span className="text-xs font-black uppercase text-slate-400">WhatsApp</span><input value={form.whatsapp ?? ''} onChange={(event) => update('whatsapp', event.target.value)} placeholder="51991234567" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />{errors.whatsapp ? <p className="mt-1 text-xs font-bold text-red-600">{errors.whatsapp}</p> : null}</label>
              <label><span className="text-xs font-black uppercase text-slate-400">Correo</span><input value={form.email ?? ''} onChange={(event) => update('email', event.target.value)} placeholder="ventas@proveedor.com" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />{errors.email ? <p className="mt-1 text-xs font-bold text-red-600">{errors.email}</p> : null}</label>
              <label><span className="text-xs font-black uppercase text-slate-400">Contacto principal</span><input value={form.contactName ?? ''} onChange={(event) => update('contactName', event.target.value)} placeholder="Nombre del contacto" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
              <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-400">Cargo del contacto</span><input value={form.contactRole ?? ''} onChange={(event) => update('contactRole', event.target.value)} placeholder="Ej. Ejecutivo comercial, ventas, logística" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={MapPin} title="Ubicación" description="Dirección fiscal y referencia de entrega." />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="md:col-span-3"><span className="text-xs font-black uppercase text-slate-400">Dirección fiscal</span><input value={form.address ?? ''} onChange={(event) => update('address', event.target.value)} placeholder="Dirección fiscal del proveedor" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
              <label><span className="text-xs font-black uppercase text-slate-400">Departamento</span><input value={form.department ?? ''} onChange={(event) => update('department', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
              <label><span className="text-xs font-black uppercase text-slate-400">Provincia</span><input value={form.province ?? ''} onChange={(event) => update('province', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
              <label><span className="text-xs font-black uppercase text-slate-400">Distrito</span><input value={form.district ?? ''} onChange={(event) => update('district', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
              <label className="md:col-span-3"><span className="text-xs font-black uppercase text-slate-400">Referencia</span><input value={form.reference ?? ''} onChange={(event) => update('reference', event.target.value)} placeholder="Referencia opcional para entregas o visitas" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" /></label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle icon={PackagePlus} title="Catálogo del proveedor" description="Productos que este proveedor ofrece para compras y abastecimiento." />
              <button type="button" onClick={addCatalogItem} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-violet px-4 text-sm font-black text-white shadow-sm hover:bg-violet-700">
                <PackagePlus size={16} />
                Agregar producto
              </button>
            </div>
            {errors.catalog ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{errors.catalog}</p> : null}

            {catalog.length ? (
              <div className="grid gap-3">
                {catalog.map((item) => {
                  const linkedProduct = products.find((product) => product.id === item.productId);
                  const isEditing = editingCatalogId === item.localId;
                  return (
                    <article key={item.localId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-slate-950">{item.name || 'Producto sin nombre'}</h4>
                            {item.productId ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">Inventario</span> : <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">Ofrecido</span>}
                            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.isActive ? 'Activo' : 'Inactivo'}</span>
                          </div>
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            {item.category || 'Sin categoría'} · {item.unit || 'Sin unidad'} · {money(item.referencePrice)}
                          </p>
                          {item.deliveryTime || item.availability ? <p className="mt-1 text-xs font-semibold text-slate-500">{item.availability || 'Sin disponibilidad'} · {item.deliveryTime || 'Sin tiempo de entrega'}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setEditingCatalogId(isEditing ? null : item.localId)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-brand-blue hover:bg-blue-50">
                            <Edit3 size={14} />
                            {isEditing ? 'Cerrar' : 'Editar'}
                          </button>
                          <button type="button" onClick={() => setCatalog((current) => current.filter((product) => product.localId !== item.localId))} className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <div>
                            <h5 className="text-sm font-black text-slate-950">Identificación del producto</h5>
                            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Producto del inventario</span>
                                <select value={item.productId ?? ''} onChange={(event) => selectProduct(item.localId, event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-violet">
                                  <option value="">Buscar producto existente...</option>
                                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
                                </select>
                                <span className="mt-1 block text-xs font-semibold text-slate-400">Vincula un producto ya registrado en inventario.</span>
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Nombre del producto ofrecido</span>
                                <input value={item.name} onChange={(event) => updateCatalog(item.localId, { name: event.target.value })} placeholder="Ejemplo: Laptop Lenovo IdeaPad, Router TP-Link, Tinta Epson negra..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet" />
                                <span className="mt-1 block text-xs font-semibold text-slate-400">Usa este campo si el producto aún no existe en inventario.</span>
                              </label>
                              {linkedProduct?.imageUrl ? <img src={linkedProduct.imageUrl} alt={linkedProduct.name} className="h-16 w-16 rounded-xl border border-slate-200 object-cover" /> : null}
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Categoría</span>
                                <select value={item.category ?? ''} onChange={(event) => updateCatalog(item.localId, { category: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet">
                                  <option value="">Seleccionar categoría</option>
                                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Unidad de compra</span>
                                <select value={item.unit ?? ''} onChange={(event) => updateCatalog(item.localId, { unit: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet">
                                  {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                                </select>
                              </label>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-black text-slate-950">Datos comerciales</h5>
                            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Costo referencial</span>
                                <div className="relative mt-1">
                                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">S/</span>
                                  <input type="number" min="0" step="0.01" value={item.referencePrice ?? ''} onChange={(event) => updateCatalog(item.localId, { referencePrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="0.00" className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-brand-violet" />
                                </div>
                                <span className="mt-1 block text-xs font-semibold text-slate-400">Costo aproximado de compra.</span>
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Cantidad mínima</span>
                                <input type="number" min="1" value={item.minOrderQuantity ?? 1} onChange={(event) => updateCatalog(item.localId, { minOrderQuantity: Math.max(Number(event.target.value), 1) })} placeholder="1" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet" />
                                <span className="mt-1 block text-xs font-semibold text-slate-400">Cantidad mínima que el proveedor suele vender.</span>
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Tiempo estimado</span>
                                <input value={item.deliveryTime ?? ''} onChange={(event) => updateCatalog(item.localId, { deliveryTime: event.target.value })} placeholder="Ej. 24 horas, 2 días, 3 a 5 días..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet" />
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Disponibilidad</span>
                                <select value={item.availability ?? 'Disponible'} onChange={(event) => updateCatalog(item.localId, { availability: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet">
                                  {availabilityOptions.map((availability) => <option key={availability} value={availability}>{availability}</option>)}
                                </select>
                              </label>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-black text-slate-950">Información adicional</h5>
                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_2fr]">
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Código del proveedor</span>
                                <input value={item.supplierSku ?? ''} onChange={(event) => updateCatalog(item.localId, { supplierSku: event.target.value })} placeholder="Opcional" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet" />
                                <span className="mt-1 block text-xs font-semibold text-slate-400">Código interno o SKU usado por el proveedor.</span>
                              </label>
                              <label>
                                <span className="text-xs font-black uppercase text-slate-400">Observación</span>
                                <input value={item.notes ?? ''} onChange={(event) => updateCatalog(item.localId, { notes: event.target.value.slice(0, 160) })} placeholder="Ejemplo: precio sujeto a disponibilidad, validar compatibilidad..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-violet" />
                              </label>
                              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
                                <input type="checkbox" checked={item.isActive ?? true} onChange={(event) => updateCatalog(item.localId, { isActive: event.target.checked })} />
                                Activo
                              </label>
                              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
                                <input type="checkbox" checked={item.isPreferred ?? false} onChange={(event) => updateCatalog(item.localId, { isPreferred: event.target.checked })} />
                                Proveedor preferido para este producto
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-800">Este proveedor aún no tiene productos asignados.</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Agrega productos para usarlos en órdenes de compra y abastecimiento.</p>
                <button type="button" onClick={addCatalogItem} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-violet px-4 text-sm font-black text-white shadow-sm hover:bg-violet-700">
                  <PackagePlus size={16} />
                  Agregar primer producto
                </button>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={Building2} title="Notas internas" description="Condiciones comerciales, horarios, políticas de entrega u observaciones." />
            <textarea value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} placeholder="Ej. Entrega en tienda, crédito a 15 días, atiende de lunes a sábado..." className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-semibold text-slate-500">Este proveedor ofrece {activeCatalog.length} producto(s).</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onClose} disabled={isSaving} className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancelar</button>
            <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? 'Guardando...' : supplier ? 'Actualizar proveedor' : 'Guardar proveedor'}
              {!isSaving ? <CheckCircle2 size={16} /> : null}
            </button>
          </div>
        </footer>
      </motion.form>
    </div>
  );
}

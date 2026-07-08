import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, PackagePlus, Search, Trash2, UserRound, X, type LucideIcon } from 'lucide-react';

import { documentLookupService } from '../../../services/documentLookupService';
import { inventoryService } from '../../inventory/services/inventory.service';
import type { Product, ProductCategory } from '../../inventory/types/inventory.types';
import { Supplier, SupplierPayload, SupplierProductPayload } from '../types/supplier.types';

interface Props {
  supplier?: Supplier | null;
  onSubmit: (payload: SupplierPayload) => Promise<void>;
  onClose: () => void;
}

type CatalogDraft = SupplierProductPayload & { localId: string };
type FieldErrors = Partial<Record<keyof SupplierPayload | 'catalog', string>>;

const emptyProduct = (): CatalogDraft => ({
  localId: crypto.randomUUID(),
  productId: '',
  name: '',
  category: '',
  unit: '',
  referencePrice: undefined,
  deliveryTime: '',
  notes: '',
  isActive: true,
});

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizePhone(value?: string) {
  const clean = digits(value ?? '');
  if (!clean) return '';
  return clean.startsWith('51') ? clean : clean.length === 9 ? `51${clean}` : clean;
}

function validate(form: SupplierPayload) {
  const errors: FieldErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = 'El nombre del proveedor es obligatorio.';
  if (form.ruc && !/^\d{11}$/.test(digits(form.ruc))) errors.ruc = 'Ingresa un RUC válido de 11 dígitos.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'El correo no tiene un formato válido.';
  const phone = digits(form.phone ?? '');
  if (phone && !/^(\d{9}|51\d{9})$/.test(phone)) errors.phone = 'Ingresa un teléfono válido para Perú.';
  const whatsapp = digits(form.whatsapp ?? '');
  if (whatsapp && !/^(\d{9}|51\d{9})$/.test(whatsapp)) errors.whatsapp = 'Ingresa un WhatsApp válido para Perú.';
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

export function SupplierForm({ supplier, onSubmit, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
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
    products: supplier?.products?.map((item) => ({
      productId: item.productId ?? '',
      name: item.name,
      category: item.category ?? item.product?.category?.name ?? '',
      unit: item.unit ?? item.product?.unit ?? '',
      referencePrice: item.referencePrice ?? undefined,
      deliveryTime: item.deliveryTime ?? '',
      notes: item.notes ?? '',
      isActive: item.isActive,
    })) ?? [],
  });
  const [catalog, setCatalog] = useState<CatalogDraft[]>(
    (supplier?.products ?? []).map((item) => ({
      localId: item.id,
      productId: item.productId ?? '',
      name: item.name,
      category: item.category ?? item.product?.category?.name ?? '',
      unit: item.unit ?? item.product?.unit ?? '',
      referencePrice: item.referencePrice ?? undefined,
      deliveryTime: item.deliveryTime ?? '',
      notes: item.notes ?? '',
      isActive: item.isActive,
    })),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void inventoryService.findProducts({ page: 1, limit: 100 }).then((response) => setProducts(response.items)).catch(() => setProducts([]));
    void inventoryService.findCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const activeCatalog = useMemo(() => catalog.filter((item) => item.name.trim()), [catalog]);

  const update = (key: keyof SupplierPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const updateCatalog = (localId: string, patch: Partial<CatalogDraft>) => {
    setCatalog((current) => current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
  };

  const selectProduct = (localId: string, productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      updateCatalog(localId, { productId: '', name: '', category: '', unit: '', referencePrice: undefined });
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
      products: activeCatalog.map(({ localId: _localId, ...item }) => item),
    };
    const nextErrors = validate(payload);
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
              <SectionTitle icon={PackagePlus} title="Catálogo del proveedor" description="Productos que ofrece para compras y abastecimiento." />
              <button type="button" onClick={() => setCatalog((current) => [...current, emptyProduct()])} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-violet px-4 text-sm font-black text-white shadow-sm hover:bg-violet-700">
                <PackagePlus size={16} />
                Agregar producto
              </button>
            </div>

            {catalog.length ? (
              <div className="grid gap-3">
                {catalog.map((item) => (
                  <article key={item.localId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_0.8fr_auto]">
                      <select value={item.productId ?? ''} onChange={(event) => selectProduct(item.localId, event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-brand-violet">
                        <option value="">Producto referencial</option>
                        {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
                      </select>
                      <input value={item.name} onChange={(event) => updateCatalog(item.localId, { name: event.target.value })} placeholder="Producto ofrecido" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                      <input list="supplier-categories" value={item.category ?? ''} onChange={(event) => updateCatalog(item.localId, { category: event.target.value })} placeholder="Categoría" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                      <input value={item.unit ?? ''} onChange={(event) => updateCatalog(item.localId, { unit: event.target.value })} placeholder="Unidad" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                      <input type="number" min="0" step="0.01" value={item.referencePrice ?? ''} onChange={(event) => updateCatalog(item.localId, { referencePrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="Precio ref." className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                      <button type="button" onClick={() => setCatalog((current) => current.filter((product) => product.localId !== item.localId))} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input value={item.deliveryTime ?? ''} onChange={(event) => updateCatalog(item.localId, { deliveryTime: event.target.value })} placeholder="Tiempo estimado de entrega" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                      <input value={item.notes ?? ''} onChange={(event) => updateCatalog(item.localId, { notes: event.target.value })} placeholder="Observación breve" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-violet" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-800">Aún no has agregado productos a este proveedor.</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Puedes guardar el proveedor ahora o registrar su catálogo para futuras compras.</p>
              </div>
            )}
            <datalist id="supplier-categories">
              {categories.map((category) => <option key={category.id} value={category.name} />)}
            </datalist>
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
            <button disabled={isSaving} className="h-11 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? 'Guardando...' : 'Guardar proveedor'}
            </button>
          </div>
        </footer>
      </motion.form>
    </div>
  );
}

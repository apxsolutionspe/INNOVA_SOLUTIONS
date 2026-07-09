import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

import { Product, ProductCategory, ProductPayload } from '../types/inventory.types';
import { normalizeCategoryName } from '../utils/category-normalization';
import { findProductImageByName } from '../utils/product-image';
import { ProductImageUploader } from './ProductImageUploader';

interface ProductFormProps {
  product?: Product | null;
  categories: ProductCategory[];
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onClose: () => void;
}

interface SpecRow {
  id: string;
  group: string;
  key: string;
  value: string;
}

const createSpecRow = (group = 'General', key = '', value = ''): SpecRow => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  group,
  key,
  value,
});

const specsToRows = (specs?: Product['technicalSpecs']) => {
  const rows = Object.entries(specs ?? {}).flatMap(([groupOrKey, rawValue]) => {
    if (rawValue && typeof rawValue === 'object') {
      return Object.entries(rawValue as Record<string, string>).map(([key, value]) => createSpecRow(groupOrKey, key, String(value ?? '')));
    }

    return [createSpecRow('General', groupOrKey, String(rawValue ?? ''))];
  });
  return rows.length ? rows : [createSpecRow()];
};

const rowsToSpecs = (rows: SpecRow[]) =>
  rows.reduce<Record<string, Record<string, string>>>((accumulator, row) => {
    const group = row.group.trim() || 'General';
    const key = row.key.trim();
    const value = row.value.trim();
    if (key && value) {
      accumulator[group] = accumulator[group] ?? {};
      accumulator[group][key] = value;
    }
    return accumulator;
  }, {});

const emptyForm: ProductPayload = {
  name: '',
  description: '',
  sku: '',
  barcode: '',
  imageUrl: null,
  brand: '',
  model: '',
  warranty: '',
  recommendedUse: '',
  salesNotes: '',
  technicalSpecs: {},
  categoryId: '',
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 0,
  unit: 'unidad',
};

export function ProductForm({ product, categories, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [specRows, setSpecRows] = useState<SpecRow[]>([createSpecRow()]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState('');
  const [focusedNumber, setFocusedNumber] = useState('');

  useEffect(() => {
    setImageError('');
    const normalizedCategoryId = product
      ? categories.find((category) => normalizeCategoryName(category.name) === normalizeCategoryName(product.category?.name))?.id ?? product.categoryId
      : categories[0]?.id ?? '';

    setForm(
      product
        ? {
            name: product.name,
            description: product.description ?? '',
            sku: product.sku,
            barcode: product.barcode ?? '',
            imageUrl: product.imageUrl ?? product.image ?? product.imagePath ?? product.thumbnail ?? null,
            brand: product.brand ?? '',
            model: product.model ?? '',
            warranty: product.warranty ?? '',
            recommendedUse: product.recommendedUse ?? '',
            salesNotes: product.salesNotes ?? '',
            technicalSpecs: product.technicalSpecs ?? {},
            categoryId: normalizedCategoryId,
            purchasePrice: product.purchasePrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: product.minStock,
            unit: product.unit,
          }
        : { ...emptyForm, categoryId: normalizedCategoryId },
    );
    setSpecRows(product ? specsToRows(product.technicalSpecs) : [createSpecRow()]);
  }, [categories, product]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) return;

    setIsSaving(true);
    try {
      await onSubmit({
        ...form,
        barcode: form.barcode?.trim() || undefined,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl || findProductImageByName(form.name) || null,
        brand: form.brand?.trim() || undefined,
        model: form.model?.trim() || undefined,
        warranty: form.warranty?.trim() || undefined,
        recommendedUse: form.recommendedUse?.trim() || undefined,
        salesNotes: form.salesNotes?.trim() || undefined,
        technicalSpecs: rowsToSpecs(specRows),
        purchasePrice: Math.max(0, Number(form.purchasePrice) || 0),
        salePrice: Math.max(0, Number(form.salePrice) || 0),
        stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
        minStock: Math.max(0, Math.floor(Number(form.minStock) || 0)),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateNumber = (field: keyof Pick<ProductPayload, 'purchasePrice' | 'salePrice' | 'stock' | 'minStock'>, value: string, integer = false) => {
    const nextValue = Math.max(0, Number(value) || 0);
    setForm({ ...form, [field]: integer ? Math.floor(nextValue) : nextValue });
  };

  const numberValue = (field: keyof Pick<ProductPayload, 'purchasePrice' | 'salePrice' | 'stock' | 'minStock'>) => {
    return focusedNumber === field && Number(form[field]) === 0 ? '' : form[field];
  };

  const updateSpecRow = (id: string, changes: Partial<SpecRow>) => {
    setSpecRows((current) => current.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  };

  const removeSpecRow = (id: string) => {
    setSpecRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : [createSpecRow()]));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <button type="button" aria-label="Cerrar formulario de producto" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-slate-950">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Registra productos para inventario, POS y ventas asistidas.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <ProductImageUploader
              value={form.imageUrl}
              productName={form.name}
              onChange={(imageUrl) => setForm({ ...form, imageUrl })}
              onErrorChange={setImageError}
            />

            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Nombre</span>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre del producto" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">SKU</span>
              <input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU único" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Código de barras</span>
              <input value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} placeholder="Opcional" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Categoría</span>
              <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100">
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Unidad</span>
              <input required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="unidad" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Precio costo</span>
              <input type="number" min="0" step="0.01" value={numberValue('purchasePrice')} onFocus={() => setFocusedNumber('purchasePrice')} onBlur={() => setFocusedNumber('')} onChange={(event) => updateNumber('purchasePrice', event.target.value)} placeholder="0.00" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Precio venta</span>
              <input type="number" min="0" step="0.01" value={numberValue('salePrice')} onFocus={() => setFocusedNumber('salePrice')} onBlur={() => setFocusedNumber('')} onChange={(event) => updateNumber('salePrice', event.target.value)} placeholder="0.00" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Stock inicial</span>
              <input type="number" min="0" value={numberValue('stock')} disabled={Boolean(product)} onFocus={() => setFocusedNumber('stock')} onBlur={() => setFocusedNumber('')} onChange={(event) => updateNumber('stock', event.target.value, true)} placeholder="0" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Stock mínimo</span>
              <input type="number" min="0" value={numberValue('minStock')} onFocus={() => setFocusedNumber('minStock')} onBlur={() => setFocusedNumber('')} onChange={(event) => updateNumber('minStock', event.target.value, true)} placeholder="0" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Descripción</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripción breve del producto" className="min-h-24 rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
            </label>

            <section className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4 sm:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-950">Ficha técnica y venta</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Agrega datos comerciales y características útiles para orientar al cliente.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Marca</span>
                  <input value={form.brand ?? ''} onChange={(event) => setForm({ ...form, brand: event.target.value })} placeholder="Ej. Lenovo" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Modelo</span>
                  <input value={form.model ?? ''} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Ej. IdeaPad" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Garantía</span>
                  <input value={form.warranty ?? ''} onChange={(event) => setForm({ ...form, warranty: event.target.value })} placeholder="Ej. 12 meses, validar con proveedor" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Uso recomendado</span>
                  <input value={form.recommendedUse ?? ''} onChange={(event) => setForm({ ...form, recommendedUse: event.target.value })} placeholder="Ej. Oficina, estudios, negocio" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                </label>
                <label className="grid gap-1.5 sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Notas para venta</span>
                  <textarea value={form.salesNotes ?? ''} onChange={(event) => setForm({ ...form, salesNotes: event.target.value })} placeholder="Argumentos breves para explicar el producto al cliente." className="min-h-20 rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Especificaciones técnicas</p>
                  <button type="button" onClick={() => setSpecRows((current) => [...current, createSpecRow()])} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-black text-brand-blue ring-1 ring-cyan-100 hover:bg-cyan-50">
                    <Plus size={15} />
                    Agregar característica
                  </button>
                </div>
                {specRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[0.9fr_1fr_1.35fr_auto]">
                    <input value={row.group} onChange={(event) => updateSpecRow(row.id, { group: event.target.value })} placeholder="Grupo: Sistema" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                    <input value={row.key} onChange={(event) => updateSpecRow(row.id, { key: event.target.value })} placeholder="Característica: Procesador" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                    <input value={row.value} onChange={(event) => updateSpecRow(row.id, { value: event.target.value })} placeholder="Valor: Intel Core i5" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
                    <button type="button" onClick={() => removeSpecRow(row.id)} className="grid h-10 w-full place-items-center rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50 sm:w-10" aria-label="Quitar característica">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancelar</button>
          <button type="submit" disabled={isSaving || Boolean(imageError)} className="min-h-11 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
            {isSaving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

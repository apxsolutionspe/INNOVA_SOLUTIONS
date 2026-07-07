import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Product, ProductCategory, ProductPayload } from '../types/inventory.types';
import { normalizeCategoryName } from '../utils/category-normalization';
import { ProductImageUploader } from './ProductImageUploader';

interface ProductFormProps {
  product?: Product | null;
  categories: ProductCategory[];
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onClose: () => void;
}

const emptyForm: ProductPayload = {
  name: '',
  description: '',
  sku: '',
  barcode: '',
  imageUrl: null,
  categoryId: '',
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 0,
  unit: 'unidad',
};

export function ProductForm({ product, categories, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState('');
  const [focusedNumber, setFocusedNumber] = useState('');

  useEffect(() => {
    setImageError('');
    const normalizedCategoryId = product
      ? categories.find(
          (category) => normalizeCategoryName(category.name) === normalizeCategoryName(product.category?.name),
        )?.id ?? product.categoryId
      : categories[0]?.id ?? '';

    setForm(
      product
        ? {
            name: product.name,
            description: product.description ?? '',
            sku: product.sku,
            barcode: product.barcode ?? '',
            imageUrl: product.imageUrl ?? product.image ?? product.imagePath ?? product.thumbnail ?? null,
            categoryId: normalizedCategoryId,
            purchasePrice: product.purchasePrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: product.minStock,
            unit: product.unit,
          }
        : { ...emptyForm, categoryId: normalizedCategoryId },
    );
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
        imageUrl: form.imageUrl || null,
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <button type="button" aria-label="Cerrar formulario de producto" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-slate-950">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Registra productos para inventario y ventas.</p>
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
            <input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU unico" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Codigo de barras</span>
            <input value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} placeholder="Opcional" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Categoría</span>
            <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100">
              <option value="">Seleccionar categoria</option>
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
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Stock minimo</span>
            <input type="number" min="0" value={numberValue('minStock')} onFocus={() => setFocusedNumber('minStock')} onBlur={() => setFocusedNumber('')} onChange={(event) => updateNumber('minStock', event.target.value, true)} placeholder="0" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Descripción</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripción breve del producto" className="min-h-24 rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100" />
          </label>
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


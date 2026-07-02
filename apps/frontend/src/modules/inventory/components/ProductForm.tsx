import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Product, ProductCategory, ProductPayload } from '../types/inventory.types';
import { ProductImage } from './ProductImage';

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
  imageUrl: '',
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

  useEffect(() => {
    setForm(
      product
        ? {
            name: product.name,
            description: product.description ?? '',
            sku: product.sku,
            barcode: product.barcode ?? '',
            imageUrl: product.imageUrl ?? product.image ?? product.imagePath ?? product.thumbnail ?? '',
            categoryId: product.categoryId,
            purchasePrice: product.purchasePrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: product.minStock,
            unit: product.unit,
          }
        : { ...emptyForm, categoryId: categories[0]?.id ?? '' },
    );
  }, [categories, product]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit(form);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-slate-950">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ProductImage product={{ name: form.name, imageUrl: form.imageUrl }} className="mx-auto h-36 w-full max-w-xs rounded-2xl" />
          </div>
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre" className="h-11 rounded-lg border border-slate-200 px-3 text-sm sm:col-span-2" />
          <input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <input value={form.barcode} onChange={(event) => setForm({ ...form, barcode: event.target.value })} placeholder="Codigo de barras" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <input value={form.imageUrl ?? ''} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="/images/products/archivo.jpg" className="h-11 rounded-lg border border-slate-200 px-3 text-sm sm:col-span-2" />
          <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="h-11 rounded-lg border border-slate-200 px-3 text-sm">
            <option value="">Seleccionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="Unidad" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(event) => setForm({ ...form, purchasePrice: Number(event.target.value) })} placeholder="Precio compra" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <input type="number" min="0" step="0.01" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })} placeholder="Precio venta" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <input type="number" min="0" value={form.stock} disabled={Boolean(product)} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} placeholder="Stock inicial" className="h-11 rounded-lg border border-slate-200 px-3 text-sm disabled:bg-slate-100" />
          <input type="number" min="0" value={form.minStock} onChange={(event) => setForm({ ...form, minStock: Number(event.target.value) })} placeholder="Stock minimo" className="h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripcion" className="min-h-24 rounded-lg border border-slate-200 px-3 py-3 text-sm sm:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancelar</button>
          <button type="submit" disabled={isSaving} className="h-10 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white disabled:opacity-70">
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

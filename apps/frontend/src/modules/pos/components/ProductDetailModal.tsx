import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Barcode, Box, CheckCircle2, Layers3, Plus, Tag, X } from 'lucide-react';

import { ProductImage } from '../../inventory/components/ProductImage';
import { Product } from '../../inventory/types/inventory.types';

interface ProductDetailModalProps {
  product: Product;
  inCartQuantity: number;
  onAdd: (product: Product, quantity?: number) => void;
  onClose: () => void;
}

function resolveStockTone(product: Product, availableStock: number) {
  if (product.stock <= 0 || availableStock <= 0) {
    return {
      label: product.stock <= 0 ? 'Sin stock' : 'Agotado en carrito',
      className: 'bg-red-50 text-red-700 ring-red-100',
      canAdd: false,
    };
  }

  if (product.stock <= product.minStock || availableStock <= product.minStock) {
    return {
      label: `Stock bajo: ${availableStock}`,
      className: 'bg-orange-50 text-orange-700 ring-orange-100',
      canAdd: true,
    };
  }

  return {
    label: `Disponible: ${availableStock}`,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    canAdd: true,
  };
}

export function ProductDetailModal({ product, inCartQuantity, onAdd, onClose }: ProductDetailModalProps) {
  const availableStock = Math.max(product.stock - inCartQuantity, 0);
  const stockTone = useMemo(() => resolveStockTone(product, availableStock), [availableStock, product]);
  const [quantity, setQuantity] = useState(stockTone.canAdd ? 1 : 0);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    setQuantity(stockTone.canAdd ? 1 : 0);
  }, [product.id, stockTone.canAdd]);

  const safeQuantity = Math.max(1, Math.min(quantity || 1, availableStock || 1));

  const handleAdd = () => {
    if (!stockTone.canAdd) return;
    onAdd(product, safeQuantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`}>
      <button type="button" aria-label="Cerrar detalle de producto" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.article
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative min-h-64 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.32),transparent_32%),linear-gradient(135deg,#0f172a,#1d4ed8_48%,#06b6d4)] p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/12 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 lg:hidden"
          >
            <X size={18} />
          </button>
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <ProductImage product={product} className="mx-auto h-44 w-44 rounded-3xl border-white/20 bg-white/95 shadow-2xl ring-1 ring-white/20" imageClassName="p-4" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Producto POS</p>
              <p className="mt-2 text-sm font-semibold text-white/80">Vista rapida para validar stock, precio y agregado al carrito.</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${stockTone.className}`}>
                {stockTone.label}
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">{product.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description?.trim() || 'Producto disponible para venta desde inventario. Sin descripcion adicional registrada.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-100 lg:grid"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-400">Precio de venta</p>
              <p className="mt-1 text-3xl font-black text-brand-blue">S/ {product.salePrice.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-400">Stock actual</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{product.stock}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
              <Barcode size={17} className="text-slate-400" />
              <span className="truncate">SKU: {product.sku || 'Sin SKU'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
              <Tag size={17} className="text-slate-400" />
              <span className="truncate">Codigo: {product.barcode || 'No registrado'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
              <Layers3 size={17} className="text-slate-400" />
              <span className="truncate">{product.category?.name ?? 'Sin categoria'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
              <Box size={17} className="text-slate-400" />
              <span>Minimo: {product.minStock} {product.unit}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-brand-blue" size={18} />
              <div>
                <p className="text-sm font-black text-slate-950">Datos de venta</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  En carrito: {inCartQuantity}. Disponible para agregar: {availableStock}. El backend validara stock y caja antes de confirmar la venta.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[8rem_1fr]">
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Cantidad</span>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                disabled={!stockTone.canAdd}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-black text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!stockTone.canAdd}
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Plus size={18} />
              Agregar al carrito
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

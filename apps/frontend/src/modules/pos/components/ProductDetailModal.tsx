import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Barcode, Box, Cpu, FileText, Layers3, Lightbulb, LucideIcon, Plus, ShieldCheck, Sparkles, Tag, X } from 'lucide-react';

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

function productSpecs(product: Product) {
  return Object.entries(product.technicalSpecs ?? {})
    .filter(([key, value]) => key.trim() && String(value ?? '').trim())
    .slice(0, 12)
    .map(([key, value]) => ({ key, value: String(value) }));
}

function salesArguments(product: Product, availableStock: number) {
  const explicitNotes = product.salesNotes
    ?.split(/\n|\. /)
    .map((item) => item.replace(/\.$/, '').trim())
    .filter(Boolean)
    .slice(0, 3) ?? [];

  const generated = [
    product.recommendedUse ? `Recomendado para ${product.recommendedUse}.` : '',
    product.salePrice > 0 ? 'Permite explicar precio, stock y características antes de confirmar la venta.' : '',
    availableStock <= product.minStock && availableStock > 0 ? 'Stock limitado, validar disponibilidad antes de cerrar la operación.' : '',
  ].filter(Boolean);

  return [...explicitNotes, ...generated].slice(0, 5);
}

function technicalRows(product: Product) {
  return [
    ['Marca', product.brand],
    ['Modelo', product.model],
    ['Garantía', product.warranty],
    ['Uso recomendado', product.recommendedUse],
    ['Unidad', product.unit],
    ['Categoría', product.category?.name],
    ['SKU', product.sku],
    ['Código de barras', product.barcode],
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim());
}

export function ProductDetailModal({ product, inCartQuantity, onAdd, onClose }: ProductDetailModalProps) {
  const availableStock = Math.max(product.stock - inCartQuantity, 0);
  const stockTone = useMemo(() => resolveStockTone(product, availableStock), [availableStock, product]);
  const [quantity, setQuantity] = useState(stockTone.canAdd ? 1 : 0);
  const specs = useMemo(() => productSpecs(product), [product]);
  const argumentsList = useMemo(() => salesArguments(product, availableStock), [availableStock, product]);
  const details = useMemo(() => technicalRows(product), [product]);

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`}>
      <button type="button" aria-label="Cerrar detalle de producto" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.article
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[0.9fr_1.25fr]"
      >
        <aside className="relative min-h-56 bg-[radial-gradient(circle_at_18%_18%,rgba(6,182,212,0.35),transparent_32%),linear-gradient(135deg,#0f172a,#1d4ed8_48%,#06b6d4)] p-5 text-white sm:min-h-72 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/12 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 lg:hidden"
          >
            <X size={18} />
          </button>
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-50 ring-1 ring-white/20">
                {product.category?.name ?? 'Producto POS'}
              </span>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Producto POS</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">{product.brand || product.model ? [product.brand, product.model].filter(Boolean).join(' ') : 'Vista rápida'}</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">Vista rápida para validar stock, precio y características antes de vender.</p>
            </div>
            <ProductImage product={product} className="mx-auto h-56 w-56 rounded-3xl border-white/20 bg-white/95 shadow-2xl ring-1 ring-white/20" imageClassName="p-4" />
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15">
              <p className="text-xs font-black uppercase tracking-wide text-cyan-100">Precio de venta</p>
              <p className="mt-1 text-3xl font-black">S/ {product.salePrice.toFixed(2)}</p>
            </div>
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${stockTone.className}`}>
                {stockTone.label}
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">{product.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description?.trim() || 'Producto disponible para venta desde inventario. Agrega una ficha técnica desde Inventario para mejorar la asesoría al cliente.'}
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Stock actual" value={product.stock} />
            <Metric label="Stock mínimo" value={product.minStock} />
            <Metric label="En carrito" value={inCartQuantity} />
            <Metric label="Disponible" value={availableStock} />
          </div>

          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            <InfoPill icon={Barcode} label={`SKU: ${product.sku || 'Sin SKU'}`} />
            <InfoPill icon={Tag} label={`Código: ${product.barcode || 'No registrado'}`} />
            <InfoPill icon={Layers3} label={product.category?.name ?? 'Sin categoría'} />
            <InfoPill icon={Box} label={`Unidad: ${product.unit}`} />
          </div>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={Cpu} title="Características principales" />
            {specs.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {specs.map((item) => (
                  <div key={`${item.key}-${item.value}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{item.key}</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyInfo title="No hay características registradas para este producto." description="Puedes agregar ficha técnica desde Inventario." />
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <SectionTitle icon={Lightbulb} title="Argumentos de venta" />
            {argumentsList.length ? (
              <ul className="mt-3 space-y-2">
                {argumentsList.map((argument) => (
                  <li key={argument} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                    <Sparkles size={16} className="mt-1 shrink-0 text-brand-blue" />
                    <span>{argument}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyInfo title="No hay argumentos de venta registrados." description="Agrega notas para venta desde Inventario." />
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={FileText} title="Datos técnicos" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-emerald-600" size={18} />
              <div>
                <p className="text-sm font-black text-slate-950">Datos de venta</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Disponible para agregar: {availableStock}. El backend validará stock y caja antes de confirmar la venta.
                </p>
              </div>
            </div>
          </section>

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
        </section>
      </motion.article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <Icon size={17} className="shrink-0 text-slate-400" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-brand-blue">
        <Icon size={17} />
      </span>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
    </div>
  );
}

function EmptyInfo({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm">
      <p className="font-black text-slate-700">{title}</p>
      <p className="mt-1 font-semibold text-slate-500">{description}</p>
    </div>
  );
}

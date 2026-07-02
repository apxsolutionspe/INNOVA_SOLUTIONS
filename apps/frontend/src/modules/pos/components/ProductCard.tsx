import { motion } from 'framer-motion';
import { Barcode, Eye, Package, Plus } from 'lucide-react';

import { ProductImage } from '../../inventory/components/ProductImage';
import { Product } from '../../inventory/types/inventory.types';

interface ProductCardProps {
  product: Product;
  inCartQuantity: number;
  onAdd: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

function resolveStock(product: Product, inCartQuantity: number) {
  const remaining = Math.max(product.stock - inCartQuantity, 0);
  if (product.stock <= 0 || remaining <= 0) {
    return {
      label: product.stock <= 0 ? 'Sin stock' : 'Agotado en carrito',
      className: 'bg-red-50 text-red-700 ring-red-100',
      canAdd: false,
      remaining,
    };
  }
  if (product.stock <= product.minStock || remaining <= product.minStock) {
    return {
      label: `Stock bajo: ${remaining}`,
      className: 'bg-orange-50 text-orange-700 ring-orange-100',
      canAdd: true,
      remaining,
    };
  }
  return {
    label: `Stock: ${remaining}`,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    canAdd: true,
    remaining,
  };
}

export function ProductCard({ product, inCartQuantity, onAdd, onViewDetail }: ProductCardProps) {
  const stock = resolveStock(product, inCartQuantity);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={stock.canAdd ? { y: -2 } : undefined}
      className={`group flex h-full min-h-[18rem] flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition ${
        stock.canAdd ? 'border-slate-200 hover:border-brand-cyan hover:shadow-lg hover:shadow-cyan-100/60' : 'border-red-100 opacity-80'
      }`}
    >
      <button type="button" onClick={() => onViewDetail(product)} className="flex items-start justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 min-h-10 break-words text-sm font-black leading-5 text-slate-950">{product.name}</p>
        </div>
        <span
          title={stock.label}
          className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${stock.className}`}
        >
          {stock.label}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onViewDetail(product)}
        className="mt-4 block outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <ProductImage product={product} className="h-28 w-full transition group-hover:scale-[1.01] group-hover:ring-cyan-200" />
      </button>

      <div className="mt-4 flex flex-col items-start gap-2">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100">
          <Barcode size={13} className="shrink-0" />
          <span className="truncate">{product.sku || 'Sin SKU'}</span>
        </span>
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 ring-1 ring-cyan-100">
          <Package size={13} className="shrink-0" />
          <span className="truncate">{product.category?.name ?? 'Sin categoria'}</span>
        </span>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-slate-400">Precio de venta</p>
            <p className="text-xl font-black text-brand-blue">S/ {product.salePrice.toFixed(2)}</p>
          </div>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {stock.remaining} disp.
          </span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!stock.canAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white shadow-sm transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <Plus size={16} />
            {stock.canAdd ? 'Agregar' : 'Sin stock'}
          </button>
          <button
            type="button"
            onClick={() => onViewDetail(product)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-cyan hover:bg-cyan-50 hover:text-brand-blue"
            aria-label={`Ver detalle de ${product.name}`}
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

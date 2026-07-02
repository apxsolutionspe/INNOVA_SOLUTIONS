import { Product } from '../types/inventory.types';
import { ProductImage } from './ProductImage';
import { StockBadge } from './StockBadge';

interface LowStockPanelProps {
  products: Product[];
}

export function LowStockPanel({ products }: LowStockPanelProps) {
  return (
    <aside className="rounded-lg border border-orange-200 bg-orange-50/70 p-5">
      <h2 className="text-lg font-bold text-slate-950">Stock critico</h2>
      <div className="mt-4 space-y-3">
        {products.length ? (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <ProductImage product={product} className="h-11 w-11 shrink-0 rounded-xl" imageClassName="p-1.5" iconClassName="h-4 w-4" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-500">Minimo: {product.minStock}</p>
                </div>
              </div>
              <StockBadge stock={product.stock} minStock={product.minStock} />
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No hay productos en stock critico.</p>
        )}
      </div>
    </aside>
  );
}

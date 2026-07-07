import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';

import { EmptyState } from '../../../components/ui/EmptyState';
import { ProductImage } from '../../inventory/components/ProductImage';
import { ecommerceService, EcommerceProduct } from '../services/ecommerce.service';

export function EcommerceProductGrid() {
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ecommerceService.products().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">Cargando catálogo online...</div>;
  if (!products.length) return <EmptyState title="Catálogo sin productos" description="El catálogo online mostrará productos activos con stock disponible." icon={PackageSearch} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.slice(0, 12).map((product) => (
        <article key={product.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <ProductImage product={product} className="mb-4 h-32 w-full rounded-xl" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-sm font-black text-slate-950">{product.name}</h2>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{product.category?.name ?? 'Sin categoria'} / {product.sku}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{product.stock} disp.</span>
          </div>
          <p className="mt-4 text-xl font-black text-brand-blue">S/ {Number(product.salePrice).toFixed(2)}</p>
        </article>
      ))}
    </div>
  );
}



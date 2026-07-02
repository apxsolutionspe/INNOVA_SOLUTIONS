import { Product } from '../../inventory/types/inventory.types';
import { PosEmptyState } from './PosEmptyState';
import { PosLoadingState } from './PosLoadingState';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  cartQuantities: Record<string, number>;
  onAdd: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, cartQuantities, onAdd, onViewDetail }: ProductGridProps) {
  if (isLoading) return <PosLoadingState />;
  if (!products.length) {
    return (
      <PosEmptyState
        title="No hay productos para mostrar"
        description="Ajusta la busqueda o revisa el inventario antes de iniciar la venta."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 min-[1680px]:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            inCartQuantity={cartQuantities[product.id] ?? 0}
            onAdd={onAdd}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>
    </div>
  );
}

import { Product } from '../types/inventory.types';
import { ProductImage } from './ProductImage';
import { StockBadge } from './StockBadge';
import { Button, DataTable, TableActions } from '../../../components/ui';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

export function ProductTable({ products, isLoading, onEdit, onDeactivate, onAdjustStock }: ProductTableProps) {
  return (
    <DataTable
      items={products}
      isLoading={isLoading}
      getRowKey={(product) => product.id}
      emptyTitle="No hay productos registrados"
      emptyDescription="Crea productos para vender desde POS y controlar stock."
      columns={[
        {
          key: 'product',
          header: 'Producto',
          cell: (product) => (
            <div className="flex min-w-0 items-center gap-3">
              <ProductImage product={product} className="h-14 w-14 shrink-0 rounded-xl" imageClassName="p-2" iconClassName="h-5 w-5" />
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">{product.name}</p>
                <p className="truncate text-xs text-slate-500">{product.sku}</p>
              </div>
            </div>
          ),
        },
        { key: 'category', header: 'Categoría', cell: (product) => product.category.name },
        { key: 'stock', header: 'Stock', cell: (product) => <StockBadge stock={product.stock} minStock={product.minStock} /> },
        { key: 'price', header: 'Precio venta', cell: (product) => `S/ ${product.salePrice.toFixed(2)}` },
        {
          key: 'actions',
          header: 'Acciones',
          className: 'text-right',
          cell: (product) => (
            <TableActions>
              <Button type="button" variant="secondary" size="sm" onClick={() => onAdjustStock(product)}>Stock</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(product)}>Editar</Button>
              <Button type="button" variant="danger" size="sm" onClick={() => onDeactivate(product)}>Desactivar</Button>
            </TableActions>
          ),
        },
      ]}
    />
  );
}


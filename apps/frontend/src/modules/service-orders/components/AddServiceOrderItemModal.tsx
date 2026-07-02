import { FormEvent, useEffect, useState } from 'react';

import { inventoryService } from '../../inventory/services/inventory.service';
import { Product } from '../../inventory/types/inventory.types';

export function AddServiceOrderItemModal({ onSubmit, onClose }: { onSubmit: (payload: { productId?: string; description: string; quantity: number; unitPrice: number }) => Promise<void>; onClose: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    void inventoryService.findProducts({ page: 1, limit: 100 }).then((response) => setProducts(response.items));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ productId: productId || undefined, description, quantity, unitPrice });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold">Agregar repuesto o servicio</h2>
        <div className="mt-4 grid gap-3">
          <select value={productId} onChange={(event) => { const product = products.find((item) => item.id === event.target.value); setProductId(event.target.value); if (product) { setDescription(product.name); setUnitPrice(product.salePrice); } }} className="h-10 rounded-lg border px-3 text-sm">
            <option value="">Item manual</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stock {product.stock}</option>)}
          </select>
          <input required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion" className="h-10 rounded-lg border px-3 text-sm" />
          <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="h-10 rounded-lg border px-3 text-sm" />
          <input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} className="h-10 rounded-lg border px-3 text-sm" />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-bold">Cancelar</button>
          <button className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Agregar</button>
        </div>
      </form>
    </div>
  );
}

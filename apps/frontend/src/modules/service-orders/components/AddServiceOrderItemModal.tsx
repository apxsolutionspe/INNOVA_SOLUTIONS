import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PackagePlus, X } from 'lucide-react';

import { inventoryService } from '../../inventory/services/inventory.service';
import { Product } from '../../inventory/types/inventory.types';
import { formatCurrency } from '../utils/service-order-formatters';

export function AddServiceOrderItemModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (payload: { productId?: string; description: string; quantity: number; unitPrice: number }) => Promise<void>;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void inventoryService.findProducts({ page: 1, limit: 100 }).then((response) => setProducts(response.items));
  }, []);

  const selectedProduct = products.find((item) => item.id === productId);
  const parsedQuantity = Math.max(Number(quantity || 0), 0);
  const parsedUnitPrice = Math.max(Number(unitPrice || 0), 0);
  const subtotal = useMemo(() => parsedQuantity * parsedUnitPrice, [parsedQuantity, parsedUnitPrice]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!description.trim()) {
      setError('Ingresa la descripción del repuesto o servicio.');
      return;
    }
    if (!parsedQuantity || parsedQuantity <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }
    if (selectedProduct && selectedProduct.stock < parsedQuantity) {
      setError('No hay stock suficiente para este repuesto.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        productId: productId || undefined,
        description: description.trim(),
        quantity: parsedQuantity,
        unitPrice: parsedUnitPrice,
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo agregar el repuesto o servicio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
              <PackagePlus size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-950">Agregar repuesto o servicio</h2>
              <p className="text-sm font-semibold text-slate-500">Selecciona un producto del inventario o registra un servicio manual.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Producto o servicio</span>
            <select
              value={productId}
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                setProductId(event.target.value);
                if (product) {
                  setDescription(product.name);
                  setUnitPrice(String(product.salePrice));
                }
              }}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Servicio manual</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stock {product.stock}</option>)}
            </select>
            {selectedProduct ? <p className="mt-2 text-xs font-bold text-slate-500">Stock disponible: {selectedProduct.stock}</p> : null}
          </label>
          <label>
            <span className="text-xs font-black uppercase text-slate-400">Descripción</span>
            <input required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. Limpieza interna, SSD Kingston 480GB" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="text-xs font-black uppercase text-slate-400">Cantidad</span>
              <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
            </label>
            <label>
              <span className="text-xs font-black uppercase text-slate-400">Precio unitario</span>
              <input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" placeholder="0.00" />
            </label>
            <div>
              <span className="text-xs font-black uppercase text-slate-400">Subtotal</span>
              <div className="mt-1 flex h-11 items-center rounded-xl bg-emerald-50 px-3 text-sm font-black text-emerald-700">{formatCurrency(subtotal)}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancelar</button>
          <button disabled={isSaving} className="h-10 rounded-xl bg-brand-blue px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  );
}

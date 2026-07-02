import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';

import { AdjustStockPayload, InventoryMovementType, Product } from '../types/inventory.types';

interface AdjustStockModalProps {
  product: Product;
  onSubmit: (payload: AdjustStockPayload) => Promise<void>;
  onClose: () => void;
}

const movementTypes: InventoryMovementType[] = ['IN', 'OUT', 'ADJUSTMENT'];

export function AdjustStockModal({ product, onSubmit, onClose }: AdjustStockModalProps) {
  const [type, setType] = useState<InventoryMovementType>('IN');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({ type, quantity, reason });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-950">Ajustar stock</h2>
        <p className="mt-2 text-sm text-slate-500">{product.name} - stock actual: {product.stock}</p>
        <div className="mt-5 space-y-4">
          <select value={type} onChange={(event) => setType(event.target.value as InventoryMovementType)} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">
            {movementTypes.map((movementType) => (
              <option key={movementType}>{movementType}</option>
            ))}
          </select>
          <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder={type === 'ADJUSTMENT' ? 'Stock final' : 'Cantidad'} required />
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" placeholder="Motivo obligatorio" required />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancelar</button>
          <button type="submit" disabled={isSaving} className="h-10 rounded-lg bg-brand-violet px-5 text-sm font-bold text-white disabled:opacity-70">{isSaving ? 'Guardando...' : 'Ajustar'}</button>
        </div>
      </motion.form>
    </div>
  );
}

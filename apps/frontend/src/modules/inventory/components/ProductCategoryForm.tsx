import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';

interface ProductCategoryFormProps {
  onSubmit: (payload: { name: string; description?: string }) => Promise<void>;
  onClose: () => void;
}

export function ProductCategoryForm({ onSubmit, onClose }: ProductCategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({ name, description });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-950">Nueva categoria</h2>
        <div className="mt-5 space-y-4">
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancelar</button>
          <button type="submit" disabled={isSaving} className="h-10 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white disabled:opacity-70">{isSaving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </motion.form>
    </div>
  );
}


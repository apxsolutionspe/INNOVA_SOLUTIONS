import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, FileText, Minus, Plus, Tag, X } from 'lucide-react';

import { QuickService } from '../types/quick-service.types';
import { estimateQuickServiceTime, getQuickServiceOptions } from '../utils/quick-service-options';

interface QuickServiceDetailModalProps {
  service: QuickService;
  onClose: () => void;
  onAdd: (service: QuickService, quantity: number, option?: string, notes?: string) => void;
}

export function QuickServiceDetailModal({ service, onClose, onAdd }: QuickServiceDetailModalProps) {
  const options = useMemo(() => getQuickServiceOptions(service), [service]);
  const estimatedTime = useMemo(() => estimateQuickServiceTime(service), [service]);
  const [quantity, setQuantity] = useState(1);
  const [option, setOption] = useState(options[0]?.label ?? '');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    onAdd(service, quantity, option, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 px-0 py-0 backdrop-blur-sm sm:place-items-center sm:px-4 sm:py-6">
      <button type="button" aria-label="Cerrar detalle" className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black uppercase text-cyan-100">
                <Tag size={14} />
                {service.category.name}
              </span>
              <h2 className="mt-3 line-clamp-2 text-2xl font-black leading-tight">{service.name}</h2>
              <p className="mt-2 text-sm font-semibold text-cyan-50/80">Cobro por {service.unit}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <FileText size={17} />
                Descripción
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {service.description || 'Servicio rápido configurable para operaciones de mostrador.'}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase text-emerald-700">Precio base</p>
              <p className="mt-1 text-3xl font-black text-emerald-800">S/ {service.unitPrice.toFixed(2)}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <Clock3 size={14} />
                {estimatedTime}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-black text-slate-950">Variantes y opciones</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {options.map((item) => {
                const active = option === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setOption(item.label)}
                    className={`min-h-20 rounded-2xl border p-3 text-left transition ${
                      active ? 'border-brand-blue bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-brand-cyan'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-slate-950">{item.label}</span>
                      {active ? (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-blue text-white">
                          <Check size={14} />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[11rem_1fr]">
            <div>
              <label className="text-sm font-black text-slate-950">Cantidad</label>
              <div className="mt-2 inline-flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-white"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  className="h-9 w-14 bg-transparent text-center text-sm font-black text-slate-950 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-black text-slate-950">Observaciones</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ejemplo: imprimir en alta calidad, enviar por correo, hojas específicas..."
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Subtotal preliminar</p>
              <p className="text-2xl font-black text-slate-950">S/ {(service.unitPrice * quantity).toFixed(2)}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="h-11 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


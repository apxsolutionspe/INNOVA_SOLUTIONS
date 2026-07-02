import { motion } from 'framer-motion';
import { Eye, Plus, Tag } from 'lucide-react';

import { QuickService } from '../types/quick-service.types';

interface QuickServiceCardProps {
  service: QuickService;
  onAdd: (service: QuickService) => void;
  onDetail: (service: QuickService) => void;
}

export function QuickServiceCard({ service, onAdd, onDetail }: QuickServiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[14.5rem] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-cyan hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{service.name}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Tag size={13} />
            {service.category.name} / {service.unit}
          </p>
        </div>
        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-black text-cyan-700 ring-1 ring-cyan-100">
          Activo
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
        {service.description || 'Servicio disponible para operacion rapida.'}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">Precio</p>
          <p className="text-2xl font-black text-brand-blue">S/ {service.unitPrice.toFixed(2)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onDetail(service)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-cyan hover:text-brand-blue"
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => onAdd(service)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white shadow-sm transition hover:bg-brand-blue"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
    </motion.article>
  );
}

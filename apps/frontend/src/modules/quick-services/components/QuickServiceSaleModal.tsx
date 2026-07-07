import { motion } from 'framer-motion';
import { CheckCircle2, ReceiptText, X } from 'lucide-react';

import { QuickServiceSale } from '../types/quick-service.types';

interface QuickServiceSaleModalProps {
  sale: QuickServiceSale;
  onReceipt: () => void;
  onClose: () => void;
}

export function QuickServiceSaleModal({ sale, onReceipt, onClose }: QuickServiceSaleModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-brand-violet via-brand-blue to-brand-cyan p-6 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20">
            <CheckCircle2 size={34} />
          </div>
          <p className="mt-4 text-sm font-black uppercase">Operación registrada</p>
          <h2 className="mt-2 text-3xl font-black">{sale.code}</h2>
          <p className="mt-2 text-sm font-semibold text-cyan-50">Movimiento de caja registrado si existe caja abierta.</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-slate-500">Total cobrado</p>
          <p className="mt-1 text-3xl font-black text-slate-950">S/ {sale.total.toFixed(2)}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onReceipt}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
            >
              <ReceiptText size={17} />
              Comprobante
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600"
            >
              <X size={17} />
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


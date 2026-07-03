import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, ReceiptText, X } from 'lucide-react';

import { Sale } from '../../sales/types/sale.types';

interface SaleSuccessModalProps {
  sale: Sale;
  onReceipt: () => void;
  onWhatsapp: () => void;
  onClose: () => void;
}

export function SaleSuccessModal({ sale, onReceipt, onWhatsapp, onClose }: SaleSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-6 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20">
            <CheckCircle2 size={34} />
          </div>
          <p className="mt-4 text-sm font-black uppercase">Venta registrada</p>
          <h2 className="mt-2 text-3xl font-black">{sale.code}</h2>
          <p className="mt-2 text-sm font-semibold text-emerald-50">Movimiento de caja y stock actualizados.</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-slate-500">Total cobrado</p>
          <p className="mt-1 text-3xl font-black text-slate-950">S/ {sale.total.toFixed(2)}</p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={onReceipt}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <ReceiptText size={17} />
              Ver comprobante
            </button>
            <button
              type="button"
              onClick={onWhatsapp}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle size={17} />
              Enviar por WhatsApp
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
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

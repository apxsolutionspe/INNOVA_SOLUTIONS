import { X } from 'lucide-react';

import { SaleReceipt } from '../types/pos.types';

interface ReceiptPreviewModalProps {
  receipt: SaleReceipt;
  onClose: () => void;
}

export function ReceiptPreviewModal({ receipt, onClose }: ReceiptPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="h-[88vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-black text-slate-950">Comprobante</p>
            <p className="text-xs font-semibold text-slate-500">{receipt.sale.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white"
          >
            <X size={16} />
            Cerrar
          </button>
        </div>
        <iframe title="Comprobante" srcDoc={receipt.html} className="h-[calc(88vh-58px)] w-full bg-white" />
      </div>
    </div>
  );
}

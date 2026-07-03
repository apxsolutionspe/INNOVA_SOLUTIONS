import { X } from 'lucide-react';

interface QuickServiceReceiptModalProps {
  html: string;
  onClose: () => void;
}

export function QuickServiceReceiptModal({ html, onClose }: QuickServiceReceiptModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[calc(100dvh-3rem)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-black text-slate-950">Comprobante</p>
            <p className="text-xs font-semibold text-slate-500">Servicio rapido</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white sm:min-h-9"
          >
            <X size={16} />
            Cerrar
          </button>
        </div>
        <iframe title="Comprobante servicio rapido" srcDoc={html} className="h-[calc(100dvh-5.25rem)] w-full bg-white sm:h-[calc(100dvh-6.75rem)]" />
      </div>
    </div>
  );
}

import { useRef } from 'react';

export function ServiceOrderReceiptModal({ html, onClose }: { html: string; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const printReceipt = () => {
    iframeRef.current?.contentWindow?.focus();
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <div className="h-[86vh] w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">Constancia imprimible</h2>
            <p className="text-sm font-semibold text-slate-500">Verifica el contenido antes de imprimir o compartir.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={printReceipt} className="h-9 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Imprimir</button>
            <button onClick={onClose} className="h-9 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">Cerrar</button>
          </div>
        </div>
        <iframe ref={iframeRef} title="Orden imprimible" srcDoc={html} className="h-[calc(86vh-88px)] w-full rounded-lg border" />
      </div>
    </div>
  );
}

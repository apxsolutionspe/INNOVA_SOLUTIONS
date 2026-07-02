export function PurchaseReceiptModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="h-[85vh] w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Comprobante de compra</h2>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cerrar</button>
        </div>
        <iframe title="Comprobante" srcDoc={html} className="h-[calc(85vh-72px)] w-full rounded-lg border border-slate-200" />
      </div>
    </div>
  );
}

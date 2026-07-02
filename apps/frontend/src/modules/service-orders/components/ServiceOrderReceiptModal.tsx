export function ServiceOrderReceiptModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <div className="h-[86vh] w-full max-w-3xl rounded-lg bg-white p-4 shadow-2xl">
        <div className="mb-3 flex justify-end"><button onClick={onClose} className="h-9 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">Cerrar</button></div>
        <iframe title="Orden imprimible" srcDoc={html} className="h-[calc(86vh-64px)] w-full rounded-lg border" />
      </div>
    </div>
  );
}

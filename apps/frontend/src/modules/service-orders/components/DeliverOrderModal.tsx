export function DeliverOrderModal({ onConfirm, onClose }: { onConfirm: () => Promise<void>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold">Entregar equipo</h2>
        <p className="mt-2 text-sm text-slate-600">Confirma que el equipo fue entregado al cliente.</p>
        <div className="mt-5 flex justify-end gap-3"><button onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-bold">Cancelar</button><button onClick={() => void onConfirm().then(onClose)} className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white">Entregar</button></div>
      </div>
    </div>
  );
}

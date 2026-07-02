export function PaymentProviderCard({ name }: { name: string }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">{name}</h2><p className="mt-2 text-sm text-slate-500">Proveedor preparado en modo mock. Requiere credenciales reales para procesar pagos.</p><span className="mt-4 inline-flex rounded-full bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">Mock</span></article>;
}

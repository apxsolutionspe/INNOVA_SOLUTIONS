export function WhatsappTemplateList() {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Plantillas</h2>{['Comprobante de venta', 'Estado de orden tecnica', 'Equipo listo', 'Recordatorio de pago', 'Resumen de compra'].map((item) => <div key={item} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">{item}</div>)}</div>;
}

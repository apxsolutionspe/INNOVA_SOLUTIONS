export function SunatConfigForm() {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Configuracion SUNAT</h2><p className="mt-2 text-sm text-slate-500">Configurar RUC, entorno y credenciales en variables de entorno del backend. No ingresar claves en frontend.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><input disabled placeholder="SUNAT_RUC" className="h-11 rounded-lg border px-3 text-sm" /><input disabled placeholder="SUNAT_ENVIRONMENT" className="h-11 rounded-lg border px-3 text-sm" /></div></div>;
}

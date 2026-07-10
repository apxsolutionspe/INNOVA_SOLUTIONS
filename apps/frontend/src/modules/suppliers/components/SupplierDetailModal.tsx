import { Building2, CheckCircle2, Link2, Mail, MapPin, PackageSearch, Phone, X } from 'lucide-react';

import { Supplier, SupplierProduct } from '../types/supplier.types';

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

function formatCurrency(value?: number | null) {
  const amount = Number(value ?? 0);
  return `S/ ${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <dt className="text-xs font-black uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-slate-800">{value || '-'}</dd>
    </div>
  );
}

function CatalogBadge({ children, tone = 'slate' }: { children: string; tone?: 'blue' | 'emerald' | 'orange' | 'violet' | 'slate' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    violet: 'bg-violet-50 text-violet-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>;
}

function ProductCard({ item }: { item: SupplierProduct }) {
  const isLinked = Boolean(item.productId && item.product);

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-black text-slate-950">{item.product?.name ?? item.name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {item.category || item.product?.category?.name || 'Sin categoría'} · {item.unit || item.product?.unit || 'Sin unidad'}
          </p>
        </div>
        {item.isPreferred ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700" title="Proveedor preferido">
            <CheckCircle2 size={16} />
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isLinked ? <CatalogBadge tone="blue">Vinculado a inventario</CatalogBadge> : <CatalogBadge tone="orange">No vinculado</CatalogBadge>}
        {item.isPreferred ? <CatalogBadge tone="emerald">Preferido</CatalogBadge> : null}
        {item.availability ? <CatalogBadge tone="violet">{item.availability}</CatalogBadge> : null}
        <CatalogBadge>{item.isActive ? 'Activo' : 'Inactivo'}</CatalogBadge>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase text-slate-400">Costo referencial</dt>
          <dd className="font-black text-slate-900">{formatCurrency(item.referencePrice)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase text-slate-400">Cantidad mínima</dt>
          <dd className="font-bold text-slate-700">{item.minOrderQuantity ?? 1}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase text-slate-400">Código proveedor</dt>
          <dd className="font-bold text-slate-700">{item.supplierSku || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase text-slate-400">Entrega</dt>
          <dd className="font-bold text-slate-700">{item.deliveryTime || '-'}</dd>
        </div>
      </dl>

      {item.notes ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-600">{item.notes}</p> : null}
      {!isLinked ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
          <Link2 className="mt-0.5 shrink-0" size={14} />
          Vincula este producto al inventario para usarlo directamente en órdenes de compra.
        </p>
      ) : null}
    </article>
  );
}

export function SupplierDetailModal({ supplier, onClose }: Props) {
  const activeProducts = (supplier.products ?? []).filter((item) => item.isActive);
  const linkedProducts = activeProducts.filter((item) => item.productId);
  const offeredProducts = activeProducts.filter((item) => !item.productId);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div className="flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-4 bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 px-5 py-5 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Detalle del proveedor</p>
            <h2 className="mt-1 text-2xl font-black">{supplier.name}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {supplier.ruc || 'Sin RUC registrado'} · {linkedProducts.length} vinculado(s) · {offeredProducts.length} ofrecido(s)
            </p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 text-white transition hover:bg-white/10" aria-label="Cerrar detalle">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50 p-5 sm:p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-blue"><Building2 size={18} /></span>
              <h3 className="font-black text-slate-950">Datos comerciales</h3>
            </div>
            <dl className="grid gap-3 md:grid-cols-3">
              <DetailItem label="Razón social" value={supplier.name} />
              <DetailItem label="RUC" value={supplier.ruc} />
              <DetailItem label="Estado SUNAT" value={supplier.sunatStatus} />
              <DetailItem label="Condición SUNAT" value={supplier.sunatCondition} />
              <DetailItem label="Compras registradas" value={supplier._count?.purchaseOrders ?? 0} />
              <DetailItem label="Estado interno" value={supplier.isActive ? 'Activo' : 'Inactivo'} />
            </dl>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Phone size={18} /></span>
                <h3 className="font-black text-slate-950">Contacto comercial</h3>
              </div>
              <dl className="grid gap-3">
                <DetailItem label="Teléfono" value={supplier.phone} />
                <DetailItem label="WhatsApp" value={supplier.whatsapp} />
                <DetailItem label="Correo" value={supplier.email} />
                <DetailItem label="Contacto principal" value={supplier.contactName} />
                <DetailItem label="Cargo" value={supplier.contactRole} />
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-brand-violet"><MapPin size={18} /></span>
                <h3 className="font-black text-slate-950">Ubicación</h3>
              </div>
              <dl className="grid gap-3">
                <DetailItem label="Dirección fiscal" value={supplier.address} />
                <DetailItem label="Departamento" value={supplier.department} />
                <DetailItem label="Provincia" value={supplier.province} />
                <DetailItem label="Distrito" value={supplier.district} />
                <DetailItem label="Referencia" value={supplier.reference} />
              </dl>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-orange-700"><PackageSearch size={18} /></span>
                <div>
                  <h3 className="font-black text-slate-950">Catálogo del proveedor</h3>
                  <p className="text-sm font-semibold text-slate-500">Productos vinculados al inventario y productos ofrecidos para evaluación.</p>
                </div>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{activeProducts.length} productos</span>
            </div>

            {activeProducts.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {activeProducts.map((item) => <ProductCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                Este proveedor aún no tiene productos ofrecidos registrados.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <Mail size={18} className="text-slate-500" />
              <h3 className="font-black text-slate-950">Notas internas</h3>
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">{supplier.notes || 'Sin notas internas registradas.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

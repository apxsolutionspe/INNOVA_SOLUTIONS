import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Barcode,
  Box,
  CheckCircle2,
  Layers3,
  Minus,
  Package,
  Plus,
  Ruler,
  ShoppingCart,
  Tag,
  X,
  ZoomIn,
} from 'lucide-react';

import { Product } from '../../inventory/types/inventory.types';
import { getProductImageSource } from '../../inventory/utils/product-image';

interface ProductDetailModalProps {
  product: Product;
  inCartQuantity: number;
  onAdd: (product: Product, quantity?: number) => void;
  onClose: () => void;
}

interface DetailItem {
  label: string;
  value: string | number;
}

const SPEC_LABELS: Record<string, string> = {
  procesador: 'Procesador',
  processor: 'Procesador',
  cpu: 'Procesador',
  ram: 'Memoria RAM',
  memoria: 'Memoria RAM',
  memoria_ram: 'Memoria RAM',
  almacenamiento: 'Almacenamiento',
  storage: 'Almacenamiento',
  disco: 'Almacenamiento',
  tipo_almacenamiento: 'Tipo de almacenamiento',
  pantalla: 'Pantalla',
  screen: 'Pantalla',
  resolucion: 'Resolución',
  resolution: 'Resolución',
  grafica: 'Gráficos',
  graficos: 'Gráficos',
  gpu: 'Gráficos',
  sistema_operativo: 'Sistema operativo',
  os: 'Sistema operativo',
  color: 'Color',
  condicion: 'Condición',
  estado: 'Condición',
  ano: 'Año',
  year: 'Año',
  version: 'Versión',
  conectividad: 'Conectividad',
  bateria: 'Batería',
  garantia: 'Garantía',
  tecnologia: 'Tecnología',
  compatibilidad: 'Compatibilidad',
  rendimiento: 'Rendimiento',
  capacidad: 'Capacidad',
  frecuencia: 'Frecuencia',
  tipo: 'Tipo',
  interfaz: 'Interfaz',
  plataforma: 'Plataforma compatible',
  duracion: 'Duración',
  dispositivos: 'Número de dispositivos',
};

function normalizeSpecKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatCurrency(value: number) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatSpecLabel(key: string) {
  const normalized = normalizeSpecKey(key);
  if (SPEC_LABELS[normalized]) return SPEC_LABELS[normalized];

  return key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function addDetail(items: DetailItem[], label: string, value?: string | number | null) {
  if (value === undefined || value === null) return;
  const normalizedValue = String(value).trim();
  if (!normalizedValue) return;
  items.push({ label, value: normalizedValue });
}

function resolveStockTone(product: Product, availableStock: number) {
  if (product.stock <= 0 || availableStock <= 0) {
    return {
      label: product.stock <= 0 ? 'Sin stock' : 'Agotado en carrito',
      className: 'bg-red-50 text-red-700 ring-red-100',
      dotClassName: 'bg-red-500',
      canAdd: false,
    };
  }

  if (product.stock <= product.minStock || availableStock <= product.minStock) {
    return {
      label: `Stock bajo: ${availableStock}`,
      className: 'bg-orange-50 text-orange-700 ring-orange-100',
      dotClassName: 'bg-orange-500',
      canAdd: true,
    };
  }

  return {
    label: `Disponible: ${availableStock}`,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dotClassName: 'bg-emerald-500',
    canAdd: true,
  };
}

function buildTechnicalSpecs(product: Product) {
  const specs: DetailItem[] = [];
  addDetail(specs, 'Marca', product.brand);
  addDetail(specs, 'Modelo', product.model);
  addDetail(specs, 'Garantía', product.warranty);
  addDetail(specs, 'Uso recomendado', product.recommendedUse);

  for (const [key, value] of Object.entries(product.technicalSpecs ?? {})) {
    addDetail(specs, formatSpecLabel(key), value);
  }

  const seen = new Set<string>();
  return specs.filter((item) => {
    const identity = `${normalizeSpecKey(item.label)}:${String(item.value).toLowerCase()}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function buildCommercialDetails(product: Product, availableStock: number) {
  const details: DetailItem[] = [];
  addDetail(details, 'SKU', product.sku);
  addDetail(details, 'Código de barras', product.barcode);
  addDetail(details, 'Categoría', product.category?.name);
  addDetail(details, 'Unidad', product.unit);
  addDetail(details, 'Stock actual', product.stock);
  addDetail(details, 'Stock mínimo', product.minStock);
  addDetail(details, 'Disponible', availableStock);
  return details;
}

export function ProductDetailModal({ product, inCartQuantity, onAdd, onClose }: ProductDetailModalProps) {
  const availableStock = Math.max(product.stock - inCartQuantity, 0);
  const stockTone = useMemo(() => resolveStockTone(product, availableStock), [availableStock, product]);
  const [quantity, setQuantity] = useState(stockTone.canAdd ? 1 : 0);
  const technicalSpecs = useMemo(() => buildTechnicalSpecs(product), [product]);
  const commercialDetails = useMemo(() => buildCommercialDetails(product, availableStock), [availableStock, product]);
  const safeQuantity = stockTone.canAdd ? Math.max(1, Math.min(quantity || 1, availableStock)) : 0;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    setQuantity(stockTone.canAdd ? 1 : 0);
  }, [product.id, stockTone.canAdd]);

  const updateQuantity = (nextValue: number) => {
    if (!stockTone.canAdd) return;
    setQuantity(Math.max(1, Math.min(nextValue, availableStock)));
  };

  const handleAdd = () => {
    if (!stockTone.canAdd) return;
    onAdd(product, safeQuantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${product.name}`}
    >
      <button type="button" aria-label="Cerrar detalle de producto" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.article
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-slate-50 shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ring-1 ${stockTone.className}`}>
                <span className={`h-2 w-2 rounded-full ${stockTone.dotClassName}`} />
                {stockTone.label}
              </span>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                {product.category?.name ?? 'Producto'}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{product.name}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Detalle rápido para asesorar y vender desde el POS.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-100"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
            <ZoomableProductImage product={product} />

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Precio de venta</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{formatCurrency(product.salePrice)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Disponible</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{availableStock}</p>
                  </div>
                </div>

                {product.description?.trim() ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Descripción</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{product.description}</p>
                  </div>
                ) : null}
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <SectionHeader icon={Tag} title="Datos comerciales" />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {commercialDetails.map((item) => (
                    <InfoRow key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </section>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionHeader icon={Ruler} title="Especificaciones técnicas" />
            {technicalSpecs.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {technicalSpecs.map((item) => (
                  <SpecCard key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
                ))}
              </div>
            ) : (
              <EmptyInfo title="Sin especificaciones registradas" description="Este producto aún no tiene ficha técnica detallada en Inventario." />
            )}
          </section>
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:w-44">
              <button
                type="button"
                onClick={() => updateQuantity(safeQuantity - 1)}
                disabled={!stockTone.canAdd || safeQuantity <= 1}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                aria-label="Disminuir cantidad"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={safeQuantity}
                disabled={!stockTone.canAdd}
                onChange={(event) => updateQuantity(Number(event.target.value))}
                className="h-10 w-14 bg-transparent text-center text-sm font-black text-slate-950 outline-none disabled:text-slate-400"
                aria-label="Cantidad para agregar al carrito"
              />
              <button
                type="button"
                onClick={() => updateQuantity(safeQuantity + 1)}
                disabled={!stockTone.canAdd || safeQuantity >= availableStock}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!stockTone.canAdd}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              <ShoppingCart size={18} />
              Agregar al carrito
            </button>
          </div>
        </footer>
      </motion.article>
    </div>
  );
}

function ZoomableProductImage({ product }: { product: Product }) {
  const imageSrc = useMemo(() => getProductImageSource(product), [product]);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const shouldShowImage = Boolean(imageSrc) && !hasError;

  useEffect(() => {
    setHasError(false);
    setPosition({ x: 50, y: 50 });
  }, [imageSrc]);

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <button
        type="button"
        onClick={() => shouldShowImage && setIsExpanded(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPosition({ x: 50, y: 50 })}
        className="group relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.16),transparent_35%),linear-gradient(135deg,#f8fafc,#ffffff)] outline-none ring-1 ring-slate-100 focus:ring-4 focus:ring-cyan-100"
        aria-label={shouldShowImage ? 'Ampliar imagen del producto' : 'Producto sin imagen registrada'}
      >
        {shouldShowImage ? (
          <img
            src={imageSrc}
            alt={`Imagen de ${product.name}`}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            style={{ transformOrigin: `${position.x}% ${position.y}%` }}
            className="h-full w-full object-contain p-5 transition duration-300 ease-out lg:group-hover:scale-[1.7]"
          />
        ) : (
          <div className="grid place-items-center text-center">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white text-brand-blue shadow-sm ring-1 ring-slate-100">
              <Package size={34} />
            </span>
            <p className="mt-3 text-sm font-black text-slate-700">Sin imagen registrada</p>
          </div>
        )}

        {shouldShowImage ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
            <ZoomIn size={14} />
            Ampliar
          </span>
        ) : null}
      </button>

      <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
        <CheckCircle2 size={15} className="text-emerald-500" />
        Pasa el cursor o toca la imagen para ampliarla.
      </p>

      <AnimatePresence>
        {isExpanded && shouldShowImage ? (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded(false);
              }}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-700 shadow-lg"
              aria-label="Cerrar imagen ampliada"
            >
              <X size={20} />
            </button>
            <motion.img
              src={imageSrc}
              alt={`Imagen ampliada de ${product.name}`}
              className="max-h-[86dvh] max-w-[92vw] rounded-3xl bg-white object-contain p-4 shadow-2xl"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Tag; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
        <Icon size={17} />
      </span>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value }: DetailItem) {
  const Icon = label === 'SKU' ? Barcode : label === 'Categoría' ? Layers3 : label === 'Unidad' ? Box : Tag;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <Icon size={16} className="shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function SpecCard({ label, value }: DetailItem) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function EmptyInfo({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm">
      <p className="font-black text-slate-700">{title}</p>
      <p className="mt-1 font-semibold text-slate-500">{description}</p>
    </div>
  );
}

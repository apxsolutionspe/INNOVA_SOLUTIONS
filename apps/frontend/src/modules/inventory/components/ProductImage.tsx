import { useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';

import { ProductImageSource, getProductImageSource, resolveProductImage } from '../utils/product-image';

interface ProductImageProps {
  product?: ProductImageSource & { name?: string };
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
}

export function ProductImage({ product, src, alt, className = '', imageClassName = '', iconClassName = '' }: ProductImageProps) {
  const resolvedSrc = useMemo(() => (src !== undefined ? resolveProductImage(src) : product ? getProductImageSource(product) : ''), [product, src]);
  const [hasError, setHasError] = useState(false);
  const imageAlt = alt ?? (product?.name ? `Imagen de ${product.name}` : 'Imagen de producto');
  const shouldShowImage = Boolean(resolvedSrc) && !hasError;

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  return (
    <div
      className={`relative grid overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_34%),linear-gradient(135deg,#ffffff,#f8fafc)] shadow-sm ${className}`}
    >
      {shouldShowImage ? (
        <img
          src={resolvedSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className={`h-full w-full object-contain p-3 transition duration-300 ${imageClassName}`}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-brand-blue">
          <div className="grid place-items-center rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-100">
            <Package className={`text-brand-blue ${iconClassName}`} size={28} aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}

export const DEFAULT_PRODUCT_IMAGE = '';

export interface ProductImageSource {
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  thumbnail?: string | null;
}

export function resolveProductImage(input?: string | null): string {
  if (!input) return DEFAULT_PRODUCT_IMAGE;

  const clean = input.trim();
  if (!clean) return DEFAULT_PRODUCT_IMAGE;

  if (/^data:image\/(jpeg|png|webp);base64,/i.test(clean)) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith('/images/')) return clean;
  if (clean.startsWith('images/')) return `/${clean}`;
  if (clean.startsWith('/public/images/')) return clean.replace('/public', '');
  if (clean.startsWith('public/images/')) return `/${clean.replace(/^public\//, '')}`;

  return DEFAULT_PRODUCT_IMAGE;
}

export function getProductImageSource(product: ProductImageSource): string {
  return resolveProductImage(product.imageUrl ?? product.image ?? product.imagePath ?? product.thumbnail);
}

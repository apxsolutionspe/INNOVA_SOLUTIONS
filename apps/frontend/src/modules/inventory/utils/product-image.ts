export const DEFAULT_PRODUCT_IMAGE = '';
export const PRODUCT_IMAGE_BASE_PATH = '/images/products';

export const PRODUCT_IMAGE_FILES = [
  'Access Point TP-Link.jpg',
  'Adaptador USB WiFi.jpg',
  'Antivirus ESET.jpg',
  'Audífonos Gamer.jpg',
  'Botella Tinta Epson Negra.jpg',
  'Cable UTP Cat 6.jpg',
  'cable-hdmi.jpg',
  'Cámara Web Full HD.jpg',
  'Cartucho Canon Color.jpg',
  'Fuente de Poder 600W.jpg',
  'Hub USB 4 Puertos.jpg',
  'Laptop Acer Aspire.jpg',
  'Laptop Asus VivoBook.jpg',
  'Laptop Dell Inspiron.jpg',
  'Laptop HP Core i5.jpg',
  'Laptop Lenovo IdeaPad.jpg',
  'Licencia Adobe Acrobat.jpg',
  'Licencia Windows 11 Pro.jpg',
  'licencia-microsoft-office.jpg',
  'memoria-ram-8gb.jpg',
  'Monitor Samsung 24.jpg',
  'Mouse Logitech.jpg',
  'Mousepad XL.jpg',
  'Papel Bond A4.jpg',
  'Parlantes Logitech.jpg',
  'Placa Madre H610.jpg',
  'Procesador Intel Core i5.jpg',
  'Repetidor WiFi.jpg',
  'Router TP-Link.jpg',
  'router-tplink.jpg',
  'ssd-kingston-480gb.jpg',
  'Suscripción Microsoft 365.jpg',
  'Switch TP-Link 8 Puertos.jpg',
  'Teclado Redragon.jpg',
  'tinta-epson.jpg',
  'Tóner HP 85A.jpg',
] as const;

const PRODUCT_IMAGE_ALIASES: Record<string, string> = {
  'audifonos gamer': 'Audífonos Gamer.jpg',
  'audifonos gamer.jpg': 'Audífonos Gamer.jpg',
  'laptop dell inspiron 3520': 'Laptop Dell Inspiron.jpg',
  'laptop asus vivobook i5': 'Laptop Asus VivoBook.jpg',
  'laptop acer aspire 5': 'Laptop Acer Aspire.jpg',
  'mousepad gamer xl': 'Mousepad XL.jpg',
  'papel bond a4 500 hojas': 'Papel Bond A4.jpg',
  'toner hp 85a compatible': 'Tóner HP 85A.jpg',
  'antivirus eset 1 usuario': 'Antivirus ESET.jpg',
  'cable utp cat6 5m': 'Cable UTP Cat 6.jpg',
  'repetidor wifi xiaomi': 'Repetidor WiFi.jpg',
};

const PRODUCT_IMAGE_FILE_SET: Set<string> = new Set(PRODUCT_IMAGE_FILES);
const PRODUCT_IMAGE_BY_KEY: Map<string, string> = new Map(
  PRODUCT_IMAGE_FILES.map((fileName) => [normalizeProductImageKey(stripImageExtension(fileName)), fileName]),
);

Object.entries(PRODUCT_IMAGE_ALIASES).forEach(([alias, fileName]) => {
  PRODUCT_IMAGE_BY_KEY.set(normalizeProductImageKey(alias), fileName);
});

export interface ProductImageSource {
  name?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  thumbnail?: string | null;
}

function stripImageExtension(value: string): string {
  return value.replace(/\.(jpe?g|png|webp)$/i, '');
}

export function normalizeProductImageKey(value?: string | null): string {
  if (!value) return '';

  return stripImageExtension(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeProductImageFileName(path: string): string {
  const fileName = path.split('/').pop() ?? '';

  try {
    return decodeURI(fileName);
  } catch {
    return fileName;
  }
}

function getProductImageRoute(fileName: string): string {
  return `${PRODUCT_IMAGE_BASE_PATH}/${fileName}`;
}

function isKnownProductImagePath(path: string): boolean {
  if (!path.startsWith(`${PRODUCT_IMAGE_BASE_PATH}/`)) return false;
  return PRODUCT_IMAGE_FILE_SET.has(decodeProductImageFileName(path));
}

export function findProductImageByName(productName?: string | null): string {
  const key = normalizeProductImageKey(productName);
  if (!key) return DEFAULT_PRODUCT_IMAGE;

  const fileName = PRODUCT_IMAGE_BY_KEY.get(key);
  return fileName ? getProductImageRoute(fileName) : DEFAULT_PRODUCT_IMAGE;
}

export function getSafeImageSrc(imageUrl?: string | null): string {
  if (!imageUrl) return DEFAULT_PRODUCT_IMAGE;

  const clean = imageUrl.trim();
  if (!clean) return DEFAULT_PRODUCT_IMAGE;
  if (/^data:image\//i.test(clean)) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;

  return encodeURI(clean);
}

export function resolveProductImage(input?: string | null): string {
  if (!input) return DEFAULT_PRODUCT_IMAGE;

  const clean = input.trim();
  if (!clean) return DEFAULT_PRODUCT_IMAGE;

  if (/^data:image\//i.test(clean)) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith(`${PRODUCT_IMAGE_BASE_PATH}/`)) {
    return isKnownProductImagePath(clean) ? getSafeImageSrc(clean) : DEFAULT_PRODUCT_IMAGE;
  }
  if (clean.startsWith('/images/')) return getSafeImageSrc(clean);
  if (clean.startsWith('images/')) return getSafeImageSrc(`/${clean}`);
  if (clean.startsWith('/public/images/')) return getSafeImageSrc(clean.replace('/public', ''));
  if (clean.startsWith('public/images/')) return getSafeImageSrc(`/${clean.replace(/^public\//, '')}`);

  return DEFAULT_PRODUCT_IMAGE;
}

export function getProductImageSource(product: ProductImageSource): string {
  const resolvedImage = resolveProductImage(product.imageUrl ?? product.image ?? product.imagePath ?? product.thumbnail);
  return resolvedImage || getSafeImageSrc(findProductImageByName(product.name));
}

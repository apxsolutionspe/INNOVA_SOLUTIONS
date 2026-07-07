import { Product, ProductCategory } from '../types/inventory.types';

export const OFFICIAL_PRODUCT_CATEGORIES = [
  'Accesorios',
  'Componentes',
  'Impresión',
  'Laptops',
  'Periféricos',
  'Redes',
  'Software',
] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  accesorios: 'Accesorios',
  componentes: 'Componentes',
  impresion: 'Impresión',
  impresiones: 'Impresión',
  laptops: 'Laptops',
  laptop: 'Laptops',
  computadoras: 'Laptops',
  computadores: 'Laptops',
  perifericos: 'Periféricos',
  periferico: 'Periféricos',
  redes: 'Redes',
  red: 'Redes',
  repuestos: 'Componentes',
  repuesto: 'Componentes',
  seguridad: 'Software',
  software: 'Software',
};

export function normalizeText(value?: string | null) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCategoryName(value?: string | null) {
  const clean = normalizeText(value);
  return CATEGORY_ALIASES[clean] ?? (value ?? '').trim();
}

export function categorySortValue(name?: string | null) {
  const officialIndex = OFFICIAL_PRODUCT_CATEGORIES.findIndex(
    (category) => normalizeText(category) === normalizeText(normalizeCategoryName(name)),
  );

  return officialIndex === -1 ? OFFICIAL_PRODUCT_CATEGORIES.length + 1 : officialIndex;
}

export function buildProductCategoryOptions(categories: ProductCategory[], products: Product[] = []) {
  const productCategoryKeys = new Set(
    products
      .filter((product) => product.isActive !== false)
      .map((product) => normalizeText(normalizeCategoryName(product.category?.name))),
  );
  const byKey = new Map<string, ProductCategory>();

  categories.forEach((category) => {
    const normalizedName = normalizeCategoryName(category.name);
    const key = normalizeText(normalizedName);
    const isOfficial = OFFICIAL_PRODUCT_CATEGORIES.some((official) => normalizeText(official) === key);
    const hasProducts = productCategoryKeys.has(key);

    if (!isOfficial && !hasProducts) return;

    const current = byKey.get(key);
    const normalizedCategory = { ...category, name: normalizedName };

    if (!current || normalizeText(current.name) !== key || category.name === normalizedName) {
      byKey.set(key, normalizedCategory);
    }
  });

  return Array.from(byKey.values()).sort((first, second) => {
    const firstOrder = categorySortValue(first.name);
    const secondOrder = categorySortValue(second.name);

    if (firstOrder !== secondOrder) return firstOrder - secondOrder;
    return first.name.localeCompare(second.name);
  });
}

export function matchesProductCategory(product: Product, selectedCategory?: ProductCategory | null) {
  if (!selectedCategory) return true;
  return (
    normalizeText(normalizeCategoryName(product.category?.name)) ===
    normalizeText(normalizeCategoryName(selectedCategory.name))
  );
}

export function matchesProductSearch(product: Product, search: string) {
  const query = normalizeText(search);
  if (!query) return true;

  const searchableText = [
    product.name,
    product.sku,
    product.category?.name,
    normalizeCategoryName(product.category?.name),
  ]
    .map(normalizeText)
    .join(' ');

  return searchableText.includes(query);
}

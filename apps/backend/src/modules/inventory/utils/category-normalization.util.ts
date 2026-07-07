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

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  impresion: ['Impresión', 'Impresion'],
  perifericos: ['Periféricos', 'Perifericos'],
  laptops: ['Laptops', 'Computadoras'],
  componentes: ['Componentes', 'Repuestos'],
  software: ['Software', 'Seguridad'],
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

export function buildCategorySearchTerms(value: string) {
  const normalized = normalizeText(value);
  const normalizedCategory = normalizeText(normalizeCategoryName(value));
  const terms = new Set<string>([value, normalizeCategoryName(value)]);

  if (CATEGORY_SEARCH_TERMS[normalized]) {
    CATEGORY_SEARCH_TERMS[normalized].forEach((term) => terms.add(term));
  }

  if (CATEGORY_SEARCH_TERMS[normalizedCategory]) {
    CATEGORY_SEARCH_TERMS[normalizedCategory].forEach((term) => terms.add(term));
  }

  return Array.from(terms).filter(Boolean);
}

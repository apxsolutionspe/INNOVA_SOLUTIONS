import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

function loadBackendEnv() {
  const candidates = [join(process.cwd(), '.env'), join(process.cwd(), 'apps', 'backend', '.env')];
  const envPath = candidates.find((candidate) => existsSync(candidate));
  if (!envPath) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadBackendEnv();

const prisma = new PrismaClient();

type SupplierPlan = {
  aliases: string[];
  products: string[];
  leadTime: string;
  categories?: string[];
};

const supplierPlans: SupplierPlan[] = [
  {
    aliases: ['Mayorista Digital Andina'],
    leadTime: '2 a 4 días',
    categories: ['Software', 'Laptops', 'Componentes', 'Periféricos'],
    products: [
      'Licencia Microsoft Office',
      'Suscripción Microsoft 365',
      'Licencia Windows 11 Pro',
      'Antivirus ESET',
      'Laptop Lenovo IdeaPad',
      'Laptop HP Core i5',
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Mouse Logitech',
      'Teclado Redragon',
    ],
  },
  {
    aliases: ['Software Legal Peru'],
    leadTime: '24 a 48 horas',
    categories: ['Software', 'Laptops', 'Periféricos'],
    products: [
      'Licencia Microsoft Office',
      'Suscripción Microsoft 365',
      'Licencia Windows 11 Pro',
      'Licencia Adobe Acrobat',
      'Antivirus ESET',
      'Laptop Dell Inspiron',
      'Laptop Acer Aspire',
      'Laptop Lenovo IdeaPad',
      'Laptop HP Core i5',
      'Mouse Logitech',
    ],
  },
  {
    aliases: ['Soluciones TP Network'],
    leadTime: '1 a 2 días',
    categories: ['Redes', 'Seguridad', 'Periféricos', 'Accesorios'],
    products: [
      'Router TP-Link',
      'Switch TP-Link 8 Puertos',
      'Access Point TP-Link',
      'Repetidor WiFi',
      'Adaptador USB WiFi',
      'Cable UTP Cat 6',
      'Cámara Web Full HD',
      'Hub USB 4 Puertos',
      'Cable HDMI',
      'Monitor Samsung 24',
    ],
  },
  {
    aliases: ['Insumos Epson Peru'],
    leadTime: '1 a 2 días',
    categories: ['Impresión', 'Periféricos', 'Accesorios'],
    products: [
      'Tinta Epson',
      'Botella Tinta Epson Negra',
      'Cartucho Canon Color',
      'Tóner HP 85A',
      'Papel Bond A4',
      'Mouse Logitech',
      'Hub USB 4 Puertos',
      'Cable HDMI',
      'Monitor Samsung 24',
      'Cámara Web Full HD',
    ],
  },
  {
    aliases: ['Componentes Express'],
    leadTime: '2 a 3 días',
    categories: ['Componentes', 'Laptops', 'Periféricos'],
    products: [
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Procesador Intel Core i5',
      'Placa Madre H610',
      'Fuente de Poder 600W',
      'Monitor Samsung 24',
      'Cable HDMI',
      'Hub USB 4 Puertos',
      'Laptop Lenovo IdeaPad',
      'Laptop HP Core i5',
    ],
  },
  {
    aliases: ['Accesorios Globales'],
    leadTime: '24 a 72 horas',
    categories: ['Accesorios', 'Periféricos', 'Redes'],
    products: [
      'Mouse Logitech',
      'Teclado Redragon',
      'Mousepad XL',
      'Audífonos Gamer',
      'Parlantes Logitech',
      'Cámara Web Full HD',
      'Hub USB 4 Puertos',
      'Cable HDMI',
      'Adaptador USB WiFi',
      'Cable UTP Cat 6',
    ],
  },
  {
    aliases: ['Los Cholos Tec', 'Cholos Tec'],
    leadTime: '2 a 4 días',
    categories: ['Laptops', 'Periféricos', 'Accesorios'],
    products: [
      'Laptop Lenovo IdeaPad',
      'Laptop HP Core i5',
      'Laptop Dell Inspiron',
      'Laptop Acer Aspire',
      'Mouse Logitech',
      'Teclado Redragon',
      'Cable HDMI',
      'Monitor Samsung 24',
      'Audífonos Gamer',
      'Hub USB 4 Puertos',
    ],
  },
  {
    aliases: ['Redes y Seguridad SAC'],
    leadTime: '1 a 2 días',
    categories: ['Redes', 'Seguridad', 'Periféricos'],
    products: [
      'Router TP-Link',
      'Switch TP-Link 8 Puertos',
      'Access Point TP-Link',
      'Repetidor WiFi',
      'Adaptador USB WiFi',
      'Cable UTP Cat 6',
      'Cámara Web Full HD',
      'Hub USB 4 Puertos',
      'Monitor Samsung 24',
      'Cable HDMI',
    ],
  },
  {
    aliases: ['Importaciones Nova Tech'],
    leadTime: '2 a 4 días',
    categories: ['Laptops', 'Componentes', 'Periféricos'],
    products: [
      'Laptop Dell Inspiron',
      'Laptop Acer Aspire',
      'Laptop Asus VivoBook',
      'Laptop HP Core i5',
      'Laptop Lenovo IdeaPad',
      'Monitor Samsung 24',
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Teclado Redragon',
      'Mouse Logitech',
    ],
  },
  {
    aliases: ['Distribuidora Compulima', 'Compulima'],
    leadTime: '2 a 3 días',
    categories: ['Laptops', 'Componentes', 'Periféricos'],
    products: [
      'Laptop Dell Inspiron',
      'Laptop Lenovo IdeaPad',
      'Laptop Acer Aspire',
      'Monitor Samsung 24',
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Fuente de Poder 600W',
      'Placa Madre H610',
      'Mouse Logitech',
      'Teclado Redragon',
    ],
  },
  {
    aliases: ['TecnoImport Peru SAC', 'TecnoImport Perú SAC', 'TecnoImport'],
    leadTime: '2 a 4 días',
    categories: ['Laptops', 'Componentes', 'Redes'],
    products: [
      'Laptop Asus VivoBook',
      'Laptop Dell Inspiron',
      'Laptop Acer Aspire',
      'Laptop HP Core i5',
      'Monitor Samsung 24',
      'Procesador Intel Core i5',
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Router TP-Link',
      'Switch TP-Link 8 Puertos',
    ],
  },
  {
    aliases: ['MENOR PARDO JHON ANTHONY', 'Pardo Jhon Anthony'],
    leadTime: '24 a 72 horas',
    categories: ['Accesorios', 'Periféricos', 'Impresión', 'Componentes', 'Redes'],
    products: [
      'Mouse Logitech',
      'Teclado Redragon',
      'Cable HDMI',
      'Papel Bond A4',
      'Tinta Epson',
      'SSD Kingston 480GB',
      'Memoria RAM 8GB',
      'Router TP-Link',
      'Audífonos Gamer',
      'Hub USB 4 Puertos',
    ],
  },
];

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsNormalized(source: string, target: string) {
  const normalizedSource = normalize(source);
  const normalizedTarget = normalize(target);
  return normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource);
}

function resolvePlan(supplierName: string) {
  const normalizedSupplier = normalize(supplierName);
  return supplierPlans.find((plan) => plan.aliases.some((alias) => normalizedSupplier.includes(normalize(alias)) || normalize(alias).includes(normalizedSupplier)));
}

function resolveProduct(products: ProductRecord[], requestedName: string, usedIds: Set<string>) {
  const normalizedRequest = normalize(requestedName);
  const requestedTokens = normalizedRequest.split(' ').filter((token) => token.length > 2);

  const exact = products.find((product) => !usedIds.has(product.id) && normalize(product.name) === normalizedRequest);
  if (exact) return exact;

  const partial = products.find((product) => !usedIds.has(product.id) && containsNormalized(product.name, requestedName));
  if (partial) return partial;

  return products.find((product) => {
    if (usedIds.has(product.id)) return false;
    const searchable = normalize(`${product.name} ${product.sku} ${product.category?.name ?? ''}`);
    const matches = requestedTokens.filter((token) => searchable.includes(token)).length;
    return matches >= Math.min(2, requestedTokens.length);
  });
}

type ProductRecord = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

function resolveFallbackProducts(products: ProductRecord[], plan: SupplierPlan | undefined, usedIds: Set<string>, desiredCount: number) {
  const categories = (plan?.categories ?? []).map(normalize);
  const coherent = products.filter((product) => {
    if (usedIds.has(product.id)) return false;
    if (!categories.length) return true;
    return categories.includes(normalize(product.category?.name));
  });

  const fallback = coherent.length >= desiredCount ? coherent : [...coherent, ...products.filter((product) => !usedIds.has(product.id) && !coherent.some((item) => item.id === product.id))];
  return fallback.slice(0, desiredCount);
}

function moneyFromProduct(product: ProductRecord) {
  const purchasePrice = Number(product.purchasePrice ?? 0);
  if (purchasePrice > 0) return Number(purchasePrice.toFixed(2));

  const salePrice = Number(product.salePrice ?? 0);
  return Number((salePrice * 0.7).toFixed(2));
}

function supplierSku(supplierName: string, product: ProductRecord) {
  const prefix = normalize(supplierName).split(' ').filter(Boolean).slice(0, 2).map((part) => part.slice(0, 3).toUpperCase()).join('');
  return `${prefix || 'PROV'}-${product.sku || product.id.slice(0, 8)}`;
}

async function ensureSupplierProduct(supplier: { id: string; name: string }, product: ProductRecord, leadTime: string) {
  const cost = moneyFromProduct(product);
  const data = {
    name: product.name,
    category: product.category?.name,
    unit: product.unit,
    supplierSku: supplierSku(supplier.name, product),
    referencePrice: cost,
    lastCost: cost,
    minOrderQuantity: 1,
    deliveryTime: leadTime,
    leadTime,
    availability: 'Disponible',
    notes: 'Relación creada para catálogo de abastecimiento y demo funcional.',
    isPreferred: false,
    isActive: true,
  };

  const existing = await prisma.supplierProduct.findFirst({
    where: {
      supplierId: supplier.id,
      productId: product.id,
    },
  });

  if (existing) {
    await prisma.supplierProduct.update({
      where: { id: existing.id },
      data: {
        ...data,
        productId: product.id,
      },
    });
    return 'updated' as const;
  }

  await prisma.supplierProduct.create({
    data: {
      ...data,
      supplier: { connect: { id: supplier.id } },
      product: { connect: { id: product.id } },
    },
  });
  return 'created' as const;
}

async function main() {
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.product.findMany({ where: { isActive: true }, include: { category: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!products.length) {
    console.log('No hay productos activos para vincular a proveedores.');
    return;
  }

  let totalCreated = 0;
  let totalUpdated = 0;
  const summary: Array<{ supplier: string; linked: number; created: number; updated: number }> = [];

  for (const supplier of suppliers) {
    const plan = resolvePlan(supplier.name);
    const usedIds = new Set<string>();
    const selectedProducts: ProductRecord[] = [];

    for (const requestedName of plan?.products ?? []) {
      const product = resolveProduct(products, requestedName, usedIds);
      if (!product) continue;
      usedIds.add(product.id);
      selectedProducts.push(product);
    }

    const missing = Math.max(10 - selectedProducts.length, 0);
    if (missing > 0) {
      const fallbackProducts = resolveFallbackProducts(products, plan, usedIds, missing);
      for (const product of fallbackProducts) {
        if (usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        selectedProducts.push(product);
      }
    }

    let created = 0;
    let updated = 0;
    const leadTime = plan?.leadTime ?? '24 a 72 horas';
    for (const product of selectedProducts.slice(0, Math.min(10, products.length))) {
      const result = await ensureSupplierProduct({ id: supplier.id, name: supplier.name }, product, leadTime);
      if (result === 'created') created += 1;
      if (result === 'updated') updated += 1;
    }

    const linked = await prisma.supplierProduct.count({
      where: {
        supplierId: supplier.id,
        isActive: true,
        productId: { not: null },
        product: { isActive: true },
      },
    });

    totalCreated += created;
    totalUpdated += updated;
    summary.push({ supplier: supplier.name, linked, created, updated });
  }

  console.log('Backfill proveedor-productos finalizado.');
  console.log(`Proveedores activos revisados: ${suppliers.length}`);
  console.log(`Relaciones creadas: ${totalCreated}`);
  console.log(`Relaciones actualizadas: ${totalUpdated}`);
  for (const item of summary) {
    console.log(`Proveedor: ${item.supplier} -> ${item.linked} productos vinculados (${item.created} creados, ${item.updated} actualizados).`);
  }
}

main()
  .catch((error) => {
    console.error('No se pudo ejecutar el backfill de productos por proveedor.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

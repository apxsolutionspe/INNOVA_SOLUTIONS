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
  supplierKeywords: string[];
  productKeywords: string[];
};

const plans: SupplierPlan[] = [
  {
    supplierKeywords: ['cholos tec'],
    productKeywords: ['laptop', 'mouse', 'teclado', 'cable', 'hdmi', 'periferico', 'accesorio'],
  },
  {
    supplierKeywords: ['tp network', 'redes'],
    productKeywords: ['router', 'switch', 'access point', 'repetidor', 'utp', 'red', 'wifi', 'adaptador'],
  },
  {
    supplierKeywords: ['accesorios globales'],
    productKeywords: ['mouse', 'teclado', 'mousepad', 'audifono', 'parlante', 'hub', 'camara', 'webcam'],
  },
  {
    supplierKeywords: ['componentes express'],
    productKeywords: ['ssd', 'ram', 'memoria', 'procesador', 'placa', 'fuente', 'componente'],
  },
  {
    supplierKeywords: ['software legal'],
    productKeywords: ['office', 'microsoft', 'windows', 'adobe', 'antivirus', 'licencia', 'software'],
  },
  {
    supplierKeywords: ['epson', 'insumos'],
    productKeywords: ['tinta', 'cartucho', 'toner', 'papel', 'impresion', 'epson', 'canon', 'hp'],
  },
  {
    supplierKeywords: ['nova tech', 'importaciones'],
    productKeywords: ['laptop', 'monitor', 'ssd', 'ram', 'mouse', 'teclado', 'componente', 'accesorio'],
  },
  {
    supplierKeywords: ['mayorista digital'],
    productKeywords: ['software', 'licencia', 'laptop', 'mouse', 'teclado', 'periferico'],
  },
  {
    supplierKeywords: ['compulima', 'tecnoimport'],
    productKeywords: ['laptop', 'computadora', 'monitor', 'router', 'mouse', 'teclado', 'ssd', 'ram', 'tinta'],
  },
];

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(normalize(keyword)));
}

async function main() {
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.product.findMany({ where: { isActive: true }, include: { category: true }, orderBy: { name: 'asc' } }),
  ]);

  let reviewedSuppliers = 0;
  let createdRelations = 0;
  let skippedRelations = 0;
  const suppliersWithoutPlan: string[] = [];
  const productsNotMatched: string[] = [];

  for (const supplier of suppliers) {
    const supplierName = normalize(supplier.name);
    const plan = plans.find((candidate) => matchesAny(supplierName, candidate.supplierKeywords));

    if (!plan) {
      suppliersWithoutPlan.push(supplier.name);
      continue;
    }

    reviewedSuppliers += 1;

    const matchedProducts = products.filter((product) => {
      const searchable = normalize(`${product.name} ${product.category?.name ?? ''} ${product.sku}`);
      return matchesAny(searchable, plan.productKeywords);
    });

    if (!matchedProducts.length) {
      productsNotMatched.push(`${supplier.name}: sin productos compatibles`);
      continue;
    }

    for (const product of matchedProducts) {
      const existing = await prisma.supplierProduct.findFirst({
        where: {
          supplierId: supplier.id,
          productId: product.id,
        },
      });

      if (existing) {
        skippedRelations += 1;
        continue;
      }

      await prisma.supplierProduct.create({
        data: {
          supplierId: supplier.id,
          productId: product.id,
          name: product.name,
          category: product.category?.name,
          unit: product.unit,
          referencePrice: product.purchasePrice,
          deliveryTime: '24 a 72 horas',
          notes: 'Relación referencial creada para demo y flujo de compras.',
          isActive: true,
        },
      });
      createdRelations += 1;
    }
  }

  console.log('Backfill proveedor-productos finalizado.');
  console.log(`Proveedores revisados: ${reviewedSuppliers}`);
  console.log(`Relaciones creadas: ${createdRelations}`);
  console.log(`Relaciones omitidas por existir: ${skippedRelations}`);
  console.log(`Proveedores sin plan referencial: ${suppliersWithoutPlan.length}`);
  if (productsNotMatched.length) {
    console.log('Productos no encontrados o sin coincidencia:');
    productsNotMatched.forEach((item) => console.log(`- ${item}`));
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

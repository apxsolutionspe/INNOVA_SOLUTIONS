import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { findProductImagePath, shouldBackfillProductImage } from '../prisma/product-images';

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

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const updated: string[] = [];
  const skipped: string[] = [];
  const withoutImage: string[] = [];

  for (const product of products) {
    const imageUrl = findProductImagePath(product.name);

    if (!imageUrl) {
      withoutImage.push(`${product.name} (${product.sku})`);
      continue;
    }

    if (!shouldBackfillProductImage(product.imageUrl)) {
      skipped.push(`${product.name} (${product.sku})`);
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl },
    });

    updated.push(`${product.name} (${product.sku}) -> ${imageUrl}`);
  }

  console.log('Backfill de imagenes de productos completado.');
  console.log(`Productos revisados: ${products.length}`);
  console.log(`Productos actualizados: ${updated.length}`);
  console.log(`Productos omitidos con imagen valida: ${skipped.length}`);
  console.log(`Productos sin imagen encontrada: ${withoutImage.length}`);

  if (updated.length) {
    console.log('\nActualizados:');
    updated.forEach((item) => console.log(`- ${item}`));
  }

  if (withoutImage.length) {
    console.log('\nSin imagen encontrada:');
    withoutImage.forEach((item) => console.log(`- ${item}`));
  }
}

main()
  .catch((error) => {
    console.error('No se pudo ejecutar el backfill de imagenes de productos.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

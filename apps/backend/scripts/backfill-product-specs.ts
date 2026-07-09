import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { findProductTechnicalProfile, shouldBackfillProductSpecs } from '../prisma/product-specs';

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
      brand: true,
      model: true,
      warranty: true,
      recommendedUse: true,
      technicalSpecs: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const updated: string[] = [];
  const skipped: string[] = [];
  const withoutMatch: string[] = [];

  for (const product of products) {
    const profile = findProductTechnicalProfile(product.name, product.category?.name);
    if (!profile) {
      withoutMatch.push(`${product.name} (${product.sku})`);
      continue;
    }

    if (!shouldBackfillProductSpecs(product.technicalSpecs)) {
      skipped.push(`${product.name} (${product.sku})`);
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        brand: product.brand || profile.brand,
        model: product.model || profile.model,
        warranty: product.warranty || profile.warranty,
        recommendedUse: product.recommendedUse || profile.recommendedUse,
        technicalSpecs: profile.technicalSpecs,
        technicalSpecsSearch: [
          product.brand || profile.brand,
          product.model || profile.model,
          product.warranty || profile.warranty,
          product.recommendedUse || profile.recommendedUse,
          JSON.stringify(profile.technicalSpecs),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      },
    });

    updated.push(`${product.name} (${product.sku})`);
  }

  console.log('Backfill de especificaciones tecnicas completado.');
  console.log(`Productos revisados: ${products.length}`);
  console.log(`Productos actualizados: ${updated.length}`);
  console.log(`Productos omitidos con ficha valida: ${skipped.length}`);
  console.log(`Productos sin coincidencia: ${withoutMatch.length}`);

  if (updated.length) {
    console.log('\nActualizados:');
    updated.forEach((item) => console.log(`- ${item}`));
  }

  if (withoutMatch.length) {
    console.log('\nSin coincidencia:');
    withoutMatch.forEach((item) => console.log(`- ${item}`));
  }
}

main()
  .catch((error) => {
    console.error('No se pudo ejecutar el backfill de especificaciones tecnicas.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

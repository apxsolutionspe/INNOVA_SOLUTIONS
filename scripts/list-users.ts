import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

function loadBackendEnv() {
  const envPath = join(process.cwd(), 'apps', 'backend', '.env');
  if (!existsSync(envPath)) return;

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

async function main() {
  loadBackendEnv();
  const prisma = new PrismaClient();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { email: 'asc' },
  });

  console.table(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      nombre: user.fullName,
      rol: user.role.name,
      estado: user.isActive ? 'activo' : 'inactivo',
      creado: user.createdAt.toISOString(),
      ultimoAcceso: user.lastLoginAt?.toISOString() ?? 'sin acceso',
    })),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(`No se pudo listar usuarios: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exit(1);
});

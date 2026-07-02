import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as bcrypt from 'bcrypt';
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

function argValue(name: string) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  loadBackendEnv();

  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
  if (nodeEnv === 'production') {
    throw new Error('Este script no puede ejecutarse en produccion.');
  }

  const email = argValue('email')?.trim().toLowerCase();
  const newPassword = argValue('password') ?? process.env.ADMIN_NEW_PASSWORD;

  if (!email) {
    throw new Error('Debes indicar --email admin@innovasolutions.com');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('Debes indicar una nueva contrasena de al menos 8 caracteres con --password o ADMIN_NEW_PASSWORD.');
  }

  const prisma = new PrismaClient();
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { description: 'Administrador general del sistema' },
    create: { name: 'ADMIN', description: 'Administrador general del sistema' },
  });
  const password = await bcrypt.hash(newPassword, 10);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        password,
        roleId: adminRole.id,
        isActive: true,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        fullName: 'Administrador Innova Solutions',
        email,
        password,
        roleId: adminRole.id,
        isActive: true,
      },
    });
  }

  await prisma.$disconnect();
  console.log(`Contrasena actualizada correctamente para el usuario ${email}`);
}

main().catch((error) => {
  console.error(`No se pudo actualizar el admin: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exit(1);
});

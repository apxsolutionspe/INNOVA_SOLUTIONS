import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(relativePath: string) {
  const envPath = join(process.cwd(), relativePath);
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
  loadEnvFile('.env');
  loadEnvFile(join('apps', 'backend', '.env'));

  if ((process.env.NODE_ENV ?? 'development').toLowerCase() === 'production') {
    throw new Error('Este script esta bloqueado en produccion.');
  }

  const email = argValue('email')?.trim().toLowerCase();
  const newPassword = argValue('password');

  if (!email) {
    throw new Error('Debes indicar --email usuario@dominio.com');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('Debes indicar --password con al menos 8 caracteres.');
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    await prisma.$disconnect();
    throw new Error(`No existe un usuario con el correo ${email}.`);
  }

  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password, isActive: true },
  });

  await prisma.$disconnect();
  console.log(`Contrasena actualizada correctamente para ${user.email}.`);
}

main().catch((error) => {
  console.error(`No se pudo resetear la contrasena: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exit(1);
});

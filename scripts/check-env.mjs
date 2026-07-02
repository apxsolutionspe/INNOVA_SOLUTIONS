import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const envFiles = [
  resolve(rootDir, '.env'),
  resolve(rootDir, 'apps/backend/.env'),
];

const sensitiveKeys = new Set(['DATABASE_URL', 'JWT_SECRET', 'JSONPE_TOKEN']);
const placeholderValues = new Set([
  '',
  'change_this_secret_before_production',
  'TOKEN_REAL_DE_JSONPE_SIN_BEARER',
  'TOKEN_REAL_JSONPE',
  '<TOKEN_JSONPE>',
  'CHANGE_ME',
]);
const requiredKeys = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'JSONPE_BASE_URL',
  'JSONPE_TOKEN',
  'JSONPE_TIMEOUT_MS',
];

function cleanValue(value) {
  const cleaned = value?.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return '';
  return cleaned.replace(/^Bearer\s+/i, '').trim();
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) return acc;

      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = cleanValue(line.slice(index + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function buildConfig() {
  const config = {};
  const sources = {};

  for (const filePath of envFiles) {
    const values = readEnvFile(filePath);
    for (const [key, value] of Object.entries(values)) {
      config[key] = value;
      sources[key] = filePath.replace(`${rootDir}\\`, '').replaceAll('\\', '/');
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    config[key] = cleanValue(value);
    sources[key] = 'process.env';
  }

  if (!config.CORS_ORIGIN && config.FRONTEND_URL) {
    config.CORS_ORIGIN = config.FRONTEND_URL;
    sources.CORS_ORIGIN = sources.FRONTEND_URL ?? 'fallback:FRONTEND_URL';
  }

  return { config, sources };
}

function isPlaceholder(value) {
  return placeholderValues.has(value) || /^change_me/i.test(value);
}

function describeValue(key, value) {
  if (!value) return 'missing';
  if (isPlaceholder(value)) return `placeholder, length: ${value.length}`;
  if (sensitiveKeys.has(key)) return `configured, length: ${value.length}`;
  return value;
}

const { config, sources } = buildConfig();
let hasMissing = false;
let hasPlaceholders = false;

console.log('Innova Solutions env check');
console.log('--------------------------');

for (const key of requiredKeys) {
  const value = config[key] ?? '';
  const description = describeValue(key, value);
  const source = sources[key] ? ` (${sources[key]})` : '';
  console.log(`${key}: ${description}${source}`);

  if (!value) hasMissing = true;
  if (value && isPlaceholder(value)) hasPlaceholders = true;
}

if (hasMissing) {
  console.log('\nResultado: faltan variables obligatorias.');
  process.exitCode = 1;
} else if (hasPlaceholders) {
  console.log('\nResultado: hay variables con valores placeholder. Configura valores reales para pruebas completas.');
  process.exitCode = 1;
} else {
  console.log('\nResultado: variables principales configuradas.');
}

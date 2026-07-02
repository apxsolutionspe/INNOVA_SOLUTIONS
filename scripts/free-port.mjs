import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const port = Number(process.argv[2] ?? 3000);
const checkOnly = process.argv.includes('--check');

if (!Number.isInteger(port) || port <= 0) {
  console.error('Debes indicar un puerto valido. Ejemplo: node scripts/free-port.mjs 3000');
  process.exit(1);
}

if ((process.env.NODE_ENV ?? 'development').toLowerCase() === 'production') {
  console.error('Este script es solo para desarrollo y no se ejecuta en production.');
  process.exit(1);
}

async function findWindowsPidsByPort(targetPort) {
  const { stdout } = await execFileAsync('netstat', ['-ano']);
  const portMarker = `:${targetPort}`;

  return Array.from(
    new Set(
      stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.includes(portMarker) && line.includes('LISTENING'))
        .map((line) => line.split(/\s+/).at(-1))
        .filter((pid) => pid && /^\d+$/.test(pid) && pid !== '0'),
    ),
  );
}

async function main() {
  if (process.platform !== 'win32') {
    console.error('Este helper esta preparado para Windows. Usa lsof/kill o cambia PORT en tu .env.');
    process.exit(1);
  }

  const pids = await findWindowsPidsByPort(port);
  if (pids.length === 0) {
    console.log(`No hay procesos escuchando en el puerto ${port}.`);
    return;
  }

  console.log(`Puerto ${port} ocupado por PID(s): ${pids.join(', ')}`);

  if (checkOnly) {
    console.log('Modo revision: no se finalizo ningun proceso.');
    return;
  }

  for (const pid of pids) {
    await execFileAsync('taskkill', ['/PID', pid, '/F']);
    console.log(`Proceso ${pid} finalizado.`);
  }
}

main().catch((error) => {
  console.error(`No se pudo revisar/liberar el puerto ${port}: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exit(1);
});

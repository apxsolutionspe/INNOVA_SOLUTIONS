# Innova Solutions

Sistema web integral de gestion para multiservicios tecnologicos. Incluye autenticacion, dashboard, clientes, inventario, POS, ventas, ordenes tecnicas, caja, servicios rapidos, compras, proveedores, reportes, rentabilidad, auditoria, notificaciones, usuarios y configuracion del negocio.

## Stack tecnologico

- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, Recharts.
- Backend: NestJS, TypeScript, JWT, Swagger/OpenAPI.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Monorepo: npm workspaces.
- DevOps: Docker Compose, Dockerfiles backend/frontend, CI GitHub Actions.
- IA local: FastAPI, Ollama, ChromaDB, LlamaIndex y RAG.

## Requisitos previos

- Node.js 22 o superior.
- npm 10 o superior.
- Docker Desktop para PostgreSQL local.

## Instalacion rapida

```bash
npm.cmd install
docker compose up -d
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000/api`
Swagger: `http://localhost:3000/api/docs`

## Variables de entorno

Copiar y ajustar:

- `.env.example`
- `apps/backend/.env.example`
- `apps/frontend/.env.example`

Variables principales:

```env
PORT=3000
DATABASE_URL="postgresql://techcenter_user:change_this_postgres_password@localhost:55432/innova_solutions?schema=public"
JWT_SECRET=change_this_secret_before_production
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
JSONPE_BASE_URL=https://api.json.pe/api
JSONPE_TOKEN=<token_jsonpe>
JSONPE_TIMEOUT_MS=30000
```

`JSONPE_TOKEN` se usa solo en el backend para DNI/RUC. Debe ir sin comillas, sin `Bearer` y sin espacios. El backend agrega el header `Authorization: Bearer <token>` al consultar Json.pe.

## Usuario de prueba

```txt
Email: admin@innovasolutions.com
Password: Admin12345
Rol: ADMIN
```

## Comandos principales

```bash
npm.cmd run dev
npm.cmd run dev:backend
npm.cmd run dev:frontend
npm.cmd run build
npm.cmd run build:backend
npm.cmd run build:frontend
npm.cmd run preview --workspace @techcenter/frontend
npm.cmd run typecheck
npm.cmd run env:check
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run prisma:studio
npm.cmd run port:check
npm.cmd run port:free
```

## Puerto backend ocupado

Si el backend falla con `EADDRINUSE` significa que el puerto configurado ya esta ocupado por otra instancia.

Revisar puerto 3000 en Windows:

```bash
netstat -ano | findstr :3000
```

Liberar el proceso manualmente:

```bash
taskkill /PID <PID> /F
```

Tambien puedes usar los scripts de desarrollo:

```bash
npm.cmd run port:check
npm.cmd run port:free
```

Como alternativa, cambia `PORT=3001` en `apps/backend/.env` y ajusta `VITE_API_URL` si el frontend debe consumir ese puerto.

## Consulta DNI/RUC

La consulta de documentos se ejecuta desde el backend para proteger el token. El frontend solo llama a `/api/document-lookup`.

Para DNI/RUC con Json.pe, configura en `apps/backend/.env`:

```env
JSONPE_BASE_URL=https://api.json.pe/api
JSONPE_TOKEN=<token_jsonpe>
JSONPE_TIMEOUT_MS=30000
```

`JSONPE_TOKEN` debe ser el token real sin `Bearer`, sin comillas y sin espacios. El backend arma internamente el header `Authorization: Bearer <token>` y consume:

- `POST https://api.json.pe/api/dni`
- `POST https://api.json.pe/api/ruc`

Prueba directa de Json.pe desde PowerShell:

```powershell
$headers = @{
  Authorization = "Bearer TOKEN_REAL_JSONPE"
  "Content-Type" = "application/json"
}

$body = @{
  dni = "73635677"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://api.json.pe/api/dni" `
  -Method Post `
  -Headers $headers `
  -Body $body `
  -TimeoutSec 30
```

Pruebas internas del backend:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/document-lookup/status" -Headers @{ Authorization = "Bearer TOKEN_INTERNO_DEL_LOGIN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/document-lookup/dni/73635677" -Headers @{ Authorization = "Bearer TOKEN_INTERNO_DEL_LOGIN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/document-lookup/ruc/20552103816" -Headers @{ Authorization = "Bearer TOKEN_INTERNO_DEL_LOGIN" }
```

Uso en Clientes:

1. Selecciona `Persona natural` y escribe un DNI de 8 digitos, o selecciona `Empresa` y escribe un RUC de 11 digitos.
2. Presiona `Consultar DNI` o `Consultar RUC`.
3. Revisa los datos autocompletados.
4. Guarda el cliente manualmente.

El frontend no expone ni consume directamente `api.json.pe`.

## PWA y experiencia movil

El frontend esta preparado como PWA instalable con `manifest.webmanifest`, service worker, iconos, navegacion movil y modo offline de consulta basica. El service worker cachea assets estaticos y evita cachear operaciones criticas como ventas, caja, compras y movimientos de inventario.

Para revisar la PWA:

```bash
npm.cmd run build:frontend
npm.cmd run preview --workspace @techcenter/frontend
```

Luego abrir el sistema en el navegador y usar la opcion `Instalar aplicacion`.

## IA Local con Ollama + LlamaIndex + ChromaDB

El proyecto incluye un microservicio separado en `apps/ai-service` para IA local. La arquitectura mantiene al frontend protegido:

```txt
React -> NestJS /api/ai-local -> FastAPI -> ChromaDB/RAG -> Ollama
```

Comandos base:

```bash
ollama pull qwen3
ollama pull llama3.2
ollama pull nomic-embed-text

cd apps/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Documentacion completa: `docs/ai-local.md`.

## Ejecucion con Docker

Desarrollo:

```bash
docker compose up -d
```

Produccion:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Usar `.env.production.example` como plantilla para despliegue real.

## Modulos principales

- Autenticacion y usuarios.
- Dashboard gerencial.
- Clientes.
- Inventario y stock.
- POS, ventas e historial.
- Ordenes tecnicas.
- Caja.
- Servicios rapidos.
- Compras y proveedores.
- Reportes y exportacion.
- Rentabilidad.
- Auditoria.
- Notificaciones.
- Configuracion del negocio.
- Integraciones futuras: SUNAT, WhatsApp, pagos, IA y eCommerce.

## Integraciones externas

El sistema incluye centro de integraciones para SUNAT, WhatsApp Cloud API, Culqi, Izipay, IA Analytics y eCommerce interno. Todas las credenciales privadas viven en backend mediante variables de entorno. El frontend solo consume estados y acciones seguras desde `/api/integrations`.

Por defecto las integraciones operan en modo `mock`, registrando auditoria y datos internos sin llamar servicios reales. Para sandbox o produccion se deben configurar credenciales reales y validar cada proveedor.

## Documentacion

- `docs/guia-instalacion.md`
- `docs/manual-usuario.md`
- `docs/arquitectura.md`
- `docs/comandos.md`
- `docs/deploy.md`
- `docs/backups.md`
- `docs/pwa.md`
- `docs/checklist-exposicion.md`
- `docs/integraciones.md`
- `docs/apis-sunat.md`
- `docs/apis-whatsapp.md`
- `docs/apis-pagos.md`
- `docs/apis-ia.md`
- `docs/apis-ecommerce.md`
- `docs/futuras-mejoras.md`

# Deploy de produccion

## Requisitos previos

- Docker y Docker Compose.
- Node.js 22 si se hara build fuera de Docker.
- Variables de entorno productivas.

Usar `.env.production.example` como plantilla para crear el `.env` del servidor.

## Variables requeridas

```env
NODE_ENV=production
POSTGRES_USER=usuario_seguro
POSTGRES_PASSWORD=password_seguro
POSTGRES_DB=innova_solutions
JWT_SECRET=secret_largo_y_seguro
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost
SWAGGER_ENABLED=false
```

Frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

## Build local

```bash
npm.cmd run typecheck
npm.cmd run build
```

## Prisma

Desarrollo:

```bash
npm.cmd run prisma:migrate
```

Produccion:

```bash
cd apps/backend
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
```

Seed solo si corresponde:

```bash
cd apps/backend
npx.cmd prisma db seed --schema prisma/schema.prisma
```

## Docker produccion

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

Servicios:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000/api`
- PostgreSQL: interno por servicio `postgres`

## Verificacion final

1. Backend responde en `/api/health`.
2. Frontend carga login.
3. Login ADMIN funciona.
4. Dashboard carga datos.
5. Swagger esta desactivado si `SWAGGER_ENABLED=false`.
6. Migraciones aplicadas con `prisma migrate deploy`.
7. Backup probado con `scripts/backup-db.ps1`.

# Comandos utiles

## Docker

```bash
docker compose up -d
docker start innova-postgres-dev
docker stop innova-postgres-dev
docker compose logs -f postgres
```

## Desarrollo

```bash
npm.cmd run dev
npm.cmd run dev:backend
npm.cmd run dev:frontend
npm.cmd run dev --workspace @techcenter/backend
npm.cmd run dev --workspace @techcenter/frontend
```

## Build y validacion

```bash
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:backend
npm.cmd run build:frontend
npm.cmd run lint
```

## Prisma

```bash
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run prisma:studio
npx.cmd prisma studio --schema apps/backend/prisma/schema.prisma
```

Comandos equivalentes dentro de backend:

```bash
cd apps/backend
npx.cmd prisma generate --schema prisma/schema.prisma
npx.cmd prisma migrate dev --schema prisma/schema.prisma
npx.cmd prisma db seed --schema prisma/schema.prisma
npx.cmd prisma studio --schema prisma/schema.prisma
```

## Produccion con Docker Compose

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

## Backups

```powershell
.\scripts\backup-db.ps1
.\scripts\restore-db.ps1 -BackupFile scripts/backups/innova_solutions-YYYYMMDD-HHMMSS.sql
```

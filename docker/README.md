# Docker

Configuracion de contenedores para desarrollo y despliegue.

## Desarrollo

```bash
docker compose up -d
docker start innova-postgres-dev
docker stop innova-postgres-dev
```

## Produccion

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Servicios productivos:

- `innova-postgres-prod`
- `innova-backend-prod`
- `innova-frontend-prod`

Antes de produccion, cambiar `JWT_SECRET`, credenciales de PostgreSQL y URLs publicas.

Para aplicar migraciones productivas usar:

```bash
cd apps/backend
npx.cmd prisma migrate deploy --schema prisma/schema.prisma
```

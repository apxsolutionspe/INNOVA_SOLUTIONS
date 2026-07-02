# Guia de instalacion

## 1. Instalar dependencias

```bash
npm.cmd install
```

## 2. Configurar variables de entorno

Copiar los archivos `.env.example` a `.env` donde corresponda:

```bash
copy .env.example .env
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
```

## 3. Levantar PostgreSQL

```bash
docker compose up -d
```

Contenedor local:

```bash
docker start innova-postgres-dev
docker stop innova-postgres-dev
```

## 4. Ejecutar Prisma

```bash
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
```

## 5. Ejecutar backend

```bash
npm.cmd run dev --workspace @techcenter/backend
```

API: `http://localhost:3000/api`
Swagger: `http://localhost:3000/api/docs`

## 6. Ejecutar frontend

```bash
npm.cmd run dev --workspace @techcenter/frontend
```

App: `http://localhost:5173`

## 7. Build de entrega

```bash
npm.cmd run typecheck
npm.cmd run build
```

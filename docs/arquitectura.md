# Arquitectura

## Vision general

Innova Solutions usa arquitectura monorepo con separacion por aplicaciones y paquetes compartidos.

```txt
apps/
  backend/   API NestJS
  frontend/  SPA React/Vite
packages/
  shared-types/
  shared-utils/
database/
docs/
docker/
scripts/
```

## Backend

El backend usa NestJS con modulos por dominio:

- `auth`
- `users`
- `roles`
- `customers`
- `inventory`
- `sales`
- `service-orders`
- `cash`
- `quick-services`
- `suppliers`
- `purchases`
- `reports`
- `profitability`
- `audit-logs`
- `notifications`
- `settings`

Cada modulo mantiene controladores, servicios, repositorios y DTOs cuando aplica.

## Frontend

El frontend usa React con modulos por dominio. Cada modulo separa:

- `pages`
- `components`
- `services`
- `hooks`
- `types`
- `utils`

La navegacion esta protegida con JWT y layout principal con sidebar/header responsive.

## Base de datos

PostgreSQL administrado por Prisma. El schema define usuarios, roles, clientes, productos, ventas, caja, servicios, compras, reportes derivados, auditoria, notificaciones y configuracion.

## Patrones usados

- Modular monorepo.
- Repository Pattern en backend.
- DTOs con validacion.
- Guards JWT y roles.
- Transacciones Prisma en flujos criticos.
- Servicios HTTP por modulo en frontend.
- Hooks para estado asincrono por modulo.

## Seguridad

- JWT para autenticacion.
- Roles `ADMIN` y `WORKER`.
- Passwords con bcrypt.
- No se retornan passwords en endpoints administrativos.
- Auditoria de acciones relevantes.

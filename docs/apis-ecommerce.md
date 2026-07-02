# eCommerce API interna

## Descripcion

API interna para catalogo online y pedidos web.

## Variables

- `ECOMMERCE_MODE`
- `ECOMMERCE_PUBLIC_URL`

## Endpoints internos

- `GET /api/ecommerce/products`
- `GET /api/ecommerce/products/:id`
- `POST /api/ecommerce/orders`
- `GET /api/ecommerce/orders`
- `GET /api/ecommerce/orders/:id`
- `PATCH /api/ecommerce/orders/:id/status`

## Reglas

- Solo muestra productos activos con stock.
- El pedido no descuenta stock al crearse.
- Al confirmar, valida stock disponible.
- Registra auditoria al crear y cambiar estado.

## Pendiente

Integracion con pagos online, tienda publica y notificaciones al cliente.

# APIs de pagos

## Proveedores

- Culqi
- Izipay

## Variables Culqi

- `CULQI_MODE`
- `CULQI_API_URL`
- `CULQI_PUBLIC_KEY`
- `CULQI_PRIVATE_KEY`

## Variables Izipay

- `IZIPAY_MODE`
- `IZIPAY_API_URL`
- `IZIPAY_USERNAME`
- `IZIPAY_PASSWORD`
- `IZIPAY_PUBLIC_KEY`
- `IZIPAY_HMACSHA256`
- `IZIPAY_HASH_KEY`
- `IZIPAY_SHOP_ID`

## Endpoints internos

- `POST /api/payments/culqi/create-link`
- `POST /api/payments/culqi/create-charge`
- `POST /api/payments/culqi/webhook`
- `POST /api/payments/izipay/create-payment`
- `POST /api/payments/izipay/create-form-token`
- `POST /api/payments/izipay/webhook`
- `GET /api/payments/transactions`
- `GET /api/payments/transactions/:id`
- `POST /api/payments/test-connection`

## Estado actual

En `mock`, crea transacciones y links simulados en `PaymentTransaction`.

## Produccion

Requiere validar sandbox, webhooks, firma/hash, conciliacion y seguridad PCI segun el proveedor.

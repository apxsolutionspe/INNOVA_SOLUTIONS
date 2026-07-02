# API SUNAT

## Descripcion

Modulo preparado para boletas, facturas, notas de credito y notas de debito.

## Variables

- `SUNAT_MODE`
- `SUNAT_API_URL`
- `SUNAT_TOKEN_URL`
- `SUNAT_CLIENT_ID`
- `SUNAT_CLIENT_SECRET`
- `SUNAT_RUC`
- `SUNAT_USERNAME`
- `SUNAT_PASSWORD`
- `SUNAT_CERT_PATH`
- `SUNAT_CERT_PASSWORD`

## Endpoints internos

- `POST /api/sunat/boleta`
- `POST /api/sunat/factura`
- `POST /api/sunat/nota-credito`
- `POST /api/sunat/nota-debito`
- `GET /api/sunat/documents`
- `GET /api/sunat/documents/:id`
- `GET /api/sunat/documents/:id/status`
- `POST /api/sunat/test-connection`

## Estado actual

`SUNAT_MODE=mock` guarda documentos con estado `MOCK`. No emite comprobantes reales.

## Produccion

Requiere credenciales reales, certificado, firma XML, validacion normativa SUNAT y pruebas de homologacion antes de uso real.

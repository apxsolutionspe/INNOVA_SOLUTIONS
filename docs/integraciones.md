# Integraciones externas

Innova Solutions centraliza integraciones externas desde el backend. El frontend nunca recibe claves privadas, tokens ni secretos.

## Centro de integraciones

Ruta frontend: `/integrations`

Endpoints internos:

- `GET /api/integrations`
- `GET /api/integrations/:provider`
- `PATCH /api/integrations/:provider/config`
- `POST /api/integrations/:provider/test`
- `PATCH /api/integrations/:provider/status`

Proveedores soportados:

- `SUNAT`
- `WHATSAPP`
- `CULQI`
- `IZIPAY`
- `AI`
- `ECOMMERCE`

Estados:

- `MOCK`: modo simulado controlado.
- `NOT_CONFIGURED`: falta configuracion.
- `CONFIGURED`: variables presentes, pendiente validacion real.
- `CONNECTED`: conexion real validada.
- `ERROR`: configuracion incompleta o error del proveedor.

## Seguridad

- Credenciales solo en `apps/backend/.env`.
- El frontend solo usa `VITE_API_URL`.
- Las claves se muestran enmascaradas cuando aplica.
- Cada prueba o accion critica registra `AuditLog`.
- Solo `ADMIN` puede configurar o probar integraciones.

## Modos

- `mock`: no llama APIs externas.
- `sandbox`: preparado para ambientes de prueba con credenciales.
- `production`: preparado para produccion real, requiere validacion del proveedor.

Ver documentos especificos:

- `docs/apis-sunat.md`
- `docs/apis-whatsapp.md`
- `docs/apis-pagos.md`
- `docs/apis-ia.md`
- `docs/apis-ecommerce.md`

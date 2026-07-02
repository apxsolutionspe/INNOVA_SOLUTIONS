# WhatsApp Cloud API

## Descripcion

Envio de mensajes, comprobantes y avisos de ordenes tecnicas desde backend.

## Variables

- `WHATSAPP_MODE`
- `WHATSAPP_API_URL`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`

## Endpoints internos

- `POST /api/whatsapp/send-message`
- `POST /api/whatsapp/send-sale-receipt`
- `POST /api/whatsapp/send-service-order`
- `POST /api/whatsapp/send-template`
- `GET /api/whatsapp/messages`
- `POST /api/whatsapp/test-connection`

## Estado actual

En `mock`, registra envios en `WhatsappMessageLog` sin llamar Meta. Con token y phone number ID puede usar el provider Cloud preparado.

## Seguridad

El token nunca debe enviarse al frontend.

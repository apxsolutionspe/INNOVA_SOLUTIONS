# IA Analytics

## Descripcion

IA Analytics usa datos agregados del backend para responder preguntas empresariales sobre ventas, inventario, caja, compras, servicios tecnicos, servicios rapidos y rentabilidad.

En produccion Render el proveedor principal es OpenAI. Si OpenAI no esta configurado o falla, el sistema responde con fallback interno basado en reglas y estadisticas reales.

## Arquitectura

Frontend React -> Backend NestJS -> AiAnalyticsModule -> OpenAI API o RuleBased fallback.

El frontend nunca llama a OpenAI directamente y nunca recibe claves privadas.

## Variables para Render

Configurar en el panel de variables de entorno de Render:

- `AI_ENABLED=true`
- `AI_PROVIDER=openai`
- `AI_MODEL=gpt-4.1-mini`
- `OPENAI_API_KEY=<clave real>`
- `AI_TIMEOUT_MS=30000`
- `AI_MAX_CONTEXT_ITEMS=20`

No modificar para esta integracion:

- `DATABASE_URL`
- `JWT_SECRET`
- `JSONPE_TOKEN`
- `PORT`
- `NODE_ENV`

## Endpoints internos

- `GET /api/ai-analytics/test-connection`
- `GET /api/ai-analytics/business-summary`
- `GET /api/ai-analytics/sales-insights`
- `GET /api/ai-analytics/inventory-insights`
- `GET /api/ai-analytics/profitability-insights`
- `POST /api/ai-analytics/ask`

Body de ejemplo:

```json
{
  "question": "Que productos debo reponer?"
}
```

## Modos

- `CLOUD_AI`: OpenAI respondio correctamente desde backend.
- `RULE_BASED_FALLBACK`: OpenAI no esta configurado, esta deshabilitado o fallo; el backend genera analisis interno.

## Seguridad

El contexto enviado a OpenAI se limita a datos agregados y sanitizados.

No se envia:

- passwords
- hashes
- tokens
- JWT
- `DATABASE_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `JSONPE_TOKEN`
- documentos personales completos innecesarios

## Validacion

Probar con:

```bash
curl -X POST https://innova-solutions-uqbx.onrender.com/api/ai-analytics/ask \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"Que productos debo reponer?\"}"
```

Si la key es valida debe responder `provider: "OPENAI"` y `mode: "CLOUD_AI"`.

Si no hay key o OpenAI falla debe responder `provider: "RULE_BASED"` y `mode: "RULE_BASED_FALLBACK"`.

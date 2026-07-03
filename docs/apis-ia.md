# IA Analytics

## Descripcion

IA Analytics usa datos agregados del backend para responder preguntas empresariales sobre ventas, inventario, caja, compras, servicios tecnicos, servicios rapidos y rentabilidad.

En produccion Render el proveedor principal es Gemini. OpenAI queda como proveedor opcional si se configura `AI_PROVIDER=openai`. Si ningun proveedor esta disponible o se alcanza un limite, el sistema responde con fallback interno basado en reglas y estadisticas reales.

## Arquitectura

Frontend React -> Backend NestJS -> AiAnalyticsModule -> Gemini API / OpenAI API opcional / RuleBased fallback.

El frontend nunca llama a Gemini ni OpenAI directamente y nunca recibe claves privadas.

## Variables para Render

Configurar en el panel de variables de entorno de Render:

- `AI_ENABLED=true`
- `AI_PROVIDER=gemini`
- `AI_MODEL=gemini-2.5-flash`
- `GEMINI_API_KEY=<clave real>`
- `OPENAI_API_KEY=`
- `AI_TIMEOUT_MS=30000`
- `AI_MAX_CONTEXT_ITEMS=10`
- `AI_MAX_OUTPUT_TOKENS=500`
- `AI_CACHE_TTL_SECONDS=300`
- `AI_USE_CACHE=true`

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

- `CLOUD_AI`: Gemini u OpenAI respondio correctamente desde backend.
- `RULE_BASED_FALLBACK`: el proveedor cloud no esta configurado, esta deshabilitado o fallo; el backend genera analisis interno.

## Control de consumo

- `GET /api/ai-analytics/test-connection` no consume tokens; solo valida configuracion.
- Gemini solo se llama cuando el usuario presiona `Analizar`.
- Las respuestas cloud se cachean por pregunta y contexto con `AI_CACHE_TTL_SECONDS`.
- `AI_MAX_CONTEXT_ITEMS` limita la cantidad de datos agregados enviados.
- `AI_MAX_OUTPUT_TOKENS` limita la longitud de respuesta cuando el proveedor lo soporta.

## Seguridad

El contexto enviado al proveedor IA se limita a datos agregados y sanitizados.

No se envia:

- passwords
- hashes
- tokens
- JWT
- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
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

Si la key de Gemini es valida debe responder `provider: "GEMINI"` y `mode: "CLOUD_AI"`.

Si no hay key o Gemini falla debe responder `provider: "RULE_BASED"` y `mode: "RULE_BASED_FALLBACK"`.

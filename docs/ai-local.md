# IA Local con Ollama, LlamaIndex y ChromaDB

## Arquitectura

Innova Solutions integra IA local como microservicio separado:

```text
Frontend React
  -> Backend NestJS /api/ai-local
  -> FastAPI apps/ai-service
  -> RAG con ChromaDB
  -> Ollama local
```

NestJS protege la comunicacion con JWT, roles y auditoria. El frontend nunca recibe claves ni llama directamente al microservicio IA.

## Componentes

- **Ollama**: servidor local para ejecutar modelos como `qwen3` o `llama3.2`.
- **ChromaDB**: base vectorial persistente para conocimiento documental.
- **LlamaIndex**: framework preparado para RAG y embeddings locales.
- **FastAPI**: microservicio IA independiente.
- **NestJS**: gateway seguro y constructor de contexto de negocio.

## Datos que analiza

El backend envia contexto agregado y seguro:

- Inventario: stock bajo, sin stock y productos vendidos.
- Ventas: ingresos del dia, ingresos del mes, metodos de pago y ticket.
- Caja: estado, ingresos, gastos y diferencia.
- Servicios rapidos: servicios mas vendidos e ingresos.
- Ordenes tecnicas: pendientes, en proceso y listas.
- Compras: pendientes, estados y proveedores activos.
- Rentabilidad: utilidad estimada, margen y alertas financieras.

No se envian passwords, tokens, hashes, DNI completos, telefonos o correos personales innecesarios.

## Endpoints FastAPI

- `GET /health`
- `GET /models`
- `POST /chat`
- `POST /index/rebuild`
- `POST /index/add-document`
- `GET /index/status`

## Endpoints NestJS

- `GET /api/ai-local/health`
- `POST /api/ai-local/ask`
- `GET /api/ai-local/index-status`
- `POST /api/ai-local/rebuild-index` solo ADMIN

## Ejecutar

```powershell
ollama pull qwen3
ollama pull llama3.2
ollama pull nomic-embed-text

cd apps/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Luego iniciar backend y frontend:

```powershell
cd apps/backend
npm run dev

cd apps/frontend
npm run dev
```

## Reconstruir indice

Desde frontend, un ADMIN puede usar el panel `Reconstruir indice` en IA Analytics.

Tambien puede probarse directo contra el microservicio:

```powershell
Invoke-RestMethod -Uri http://localhost:8001/index/status
```

## Limitaciones

- La calidad depende del modelo local instalado.
- Si Ollama esta apagado, el sistema muestra error controlado o respuesta fallback.
- La indexacion inicial puede tardar segun documentos y hardware.
- No se implementan pagos, SUNAT o WhatsApp con IA en esta fase.

## Mejoras futuras

- Programar reindexacion automatica.
- Agregar streaming de respuestas.
- Registrar metricas de latencia y uso.
- Afinar prompts por rol.
- Agregar historial de conversaciones.

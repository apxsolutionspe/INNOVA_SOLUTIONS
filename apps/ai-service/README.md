# Innova AI Service

Microservicio FastAPI para IA local de Innova Solutions.

## Arquitectura

Frontend React -> Backend NestJS `/api/ai-local` -> FastAPI -> Ollama + ChromaDB/RAG.

El frontend no accede directamente a este servicio. NestJS actua como gateway seguro con JWT, roles y auditoria.

## Requisitos

- Python 3.11+
- Ollama instalado
- Modelo conversacional local
- Modelo de embeddings local

## Instalar Ollama y modelos

```powershell
ollama pull qwen3
ollama pull llama3.2
ollama pull nomic-embed-text
ollama list
ollama run qwen3
```

## Configurar entorno

```powershell
cd apps/ai-service
copy .env.example .env
```

Variables principales:

- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_MODEL=qwen3`
- `OLLAMA_FALLBACK_MODEL=llama3.2`
- `OLLAMA_EMBEDDING_MODEL=nomic-embed-text`
- `ENABLE_RAG=true`

## Ejecutar local

```powershell
cd apps/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Endpoints

- `GET /health`
- `GET /models`
- `POST /chat`
- `POST /index/rebuild`
- `POST /index/add-document`
- `GET /index/status`

## Docker

```powershell
cd apps/ai-service
docker build -t innova-ai-service .
docker run --rm -p 8001:8001 --env OLLAMA_BASE_URL=http://host.docker.internal:11434 innova-ai-service
```

## Seguridad

- No indexar `.env`, tokens, passwords ni secretos.
- No enviar datos personales completos al modelo.
- El microservicio debe quedar detras de NestJS.
- La reconstruccion del indice se solicita desde backend solo para ADMIN.

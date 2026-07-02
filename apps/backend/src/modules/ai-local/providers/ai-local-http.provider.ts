import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiLocalHttpProvider {
  constructor(private readonly config: ConfigService) {}

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const baseUrl = this.config.get<string>('AI_LOCAL_SERVICE_URL') ?? 'http://localhost:8001';
    const timeoutMs = Number(this.config.get<string>('AI_LOCAL_TIMEOUT_MS') ?? 60000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal });
      if (!response.ok) {
        throw new ServiceUnavailableException('IA local no disponible. Verifica que Ollama y el microservicio esten ejecutandose.');
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('IA local no disponible. Verifica que Ollama y el microservicio esten ejecutandose.');
    } finally {
      clearTimeout(timeout);
    }
  }
}

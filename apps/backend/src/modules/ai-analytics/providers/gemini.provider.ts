import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AiHealthResult,
  AiProviderResponse,
  BusinessAiInput,
  BusinessAiProvider,
} from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements BusinessAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(private readonly config: ConfigService) {}

  get providerName() {
    return 'GEMINI' as const;
  }

  get modelName() {
    return this.config.get<string>('AI_MODEL') ?? 'gemini-2.5-flash';
  }

  private get apiKey() {
    return this.config.get<string>('GEMINI_API_KEY')?.trim() ?? '';
  }

  private get timeoutMs() {
    const value = Number(this.config.get<string>('AI_TIMEOUT_MS') ?? 30000);
    return Number.isFinite(value) && value > 0 ? value : 30000;
  }

  private get maxOutputTokens() {
    const value = Number(this.config.get<string>('AI_MAX_OUTPUT_TOKENS') ?? 500);
    return Number.isFinite(value) && value > 0 ? Math.min(value, 2048) : 500;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async healthCheck(): Promise<AiHealthResult> {
    const keyConfigured = this.isConfigured();
    return {
      provider: 'GEMINI',
      model: this.modelName,
      configured: keyConfigured,
      keyConfigured,
      timeoutMs: this.timeoutMs,
      mode: keyConfigured ? 'CLOUD_AI' : 'RULE_BASED_FALLBACK',
      message: keyConfigured
        ? 'Gemini configurado para analisis cloud.'
        : 'Gemini no esta configurado. Se usara analisis interno.',
    };
  }

  async askBusinessQuestion(input: BusinessAiInput): Promise<AiProviderResponse> {
    if (!this.isConfigured()) {
      return {
        provider: 'GEMINI',
        mode: 'RULE_BASED_FALLBACK',
        answer: 'Gemini no esta configurado. Se usara analisis interno.',
        warnings: ['Falta GEMINI_API_KEY en backend.'],
      };
    }

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelName)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: this.buildPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: this.maxOutputTokens,
          },
        }),
      });

      const durationMs = Date.now() - startedAt;
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const mapped = this.mapGeminiError(response.status, payload);
        this.logger.warn(`Gemini error provider=GEMINI model=${this.modelName} durationMs=${durationMs} status=${response.status} errorType=${mapped.errorType}`);
        return {
          provider: 'GEMINI',
          mode: 'RULE_BASED_FALLBACK',
          answer: mapped.message,
          warnings: [mapped.message],
          metadata: { durationMs, errorType: mapped.errorType, status: response.status },
        };
      }

      const answer = this.extractText(payload);
      this.logger.log(`Gemini ok provider=GEMINI model=${this.modelName} durationMs=${durationMs}`);

      return {
        provider: 'GEMINI',
        mode: 'CLOUD_AI',
        answer: answer || 'Gemini no devolvio contenido util.',
        metadata: {
          durationMs,
          model: this.modelName,
        },
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const mapped = this.mapNetworkError(error);
      this.logger.warn(`Gemini error provider=GEMINI model=${this.modelName} durationMs=${durationMs} errorType=${mapped.errorType}`);
      return {
        provider: 'GEMINI',
        mode: 'RULE_BASED_FALLBACK',
        answer: mapped.message,
        warnings: [mapped.message],
        metadata: { durationMs, errorType: mapped.errorType },
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async ask(prompt: string): Promise<AiProviderResponse> {
    return this.askBusinessQuestion({
      question: prompt,
      systemPrompt: 'Responde en espanol profesional usando solo el contexto entregado.',
      businessContext: { prompt },
    });
  }

  async testConnection(): Promise<AiProviderResponse> {
    const health = await this.healthCheck();
    return {
      provider: 'GEMINI',
      mode: health.keyConfigured ? 'CLOUD_AI' : 'RULE_BASED_FALLBACK',
      answer: health.message,
      warnings: health.keyConfigured ? [] : ['GEMINI_API_KEY no esta configurada.'],
      metadata: { ...health, tokenConsumingCheck: false },
    };
  }

  private buildPrompt(input: BusinessAiInput) {
    return [
      input.systemPrompt,
      '',
      `Pregunta del usuario: ${input.question}`,
      '',
      'Contexto empresarial agregado y sanitizado:',
      JSON.stringify(input.businessContext, null, 2),
    ].join('\n');
  }

  private extractText(payload: unknown) {
    const candidate = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0];
    return candidate?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
  }

  private mapGeminiError(status: number, payload: unknown) {
    const message = (payload as { error?: { message?: string; status?: string } })?.error?.message ?? '';
    const statusName = (payload as { error?: { status?: string } })?.error?.status ?? '';
    const normalized = `${message} ${statusName}`.toLowerCase();

    if (status === 401 || status === 403) {
      return { errorType: 'AUTHENTICATION', message: 'No se pudo autenticar con Gemini. Verifica GEMINI_API_KEY.' };
    }
    if (status === 429 || normalized.includes('quota') || normalized.includes('rate')) {
      return { errorType: 'RATE_LIMIT', message: 'Gemini no respondio o alcanzo su limite gratuito. Se genero analisis interno con datos del sistema.' };
    }
    if (status >= 500) {
      return { errorType: 'SERVER_ERROR', message: 'Gemini no esta disponible temporalmente. Se genero analisis interno.' };
    }
    return { errorType: statusName || `HTTP_${status}`, message: 'No se pudo consultar Gemini. Se genero analisis interno con datos del sistema.' };
  }

  private mapNetworkError(error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { errorType: 'TIMEOUT', message: 'Gemini no respondio dentro del tiempo esperado. Se genero analisis interno.' };
    }
    return { errorType: error instanceof Error ? error.name : 'NETWORK_ERROR', message: 'No se pudo conectar con Gemini. Se genero analisis interno.' };
  }
}

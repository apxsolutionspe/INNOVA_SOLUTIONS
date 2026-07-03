import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import {
  AiHealthResult,
  AiProviderResponse,
  BusinessAiInput,
  BusinessAiProvider,
} from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements BusinessAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(private readonly config: ConfigService) {}

  get providerName() {
    return 'OPENAI' as const;
  }

  get modelName() {
    return this.config.get<string>('AI_MODEL') ?? 'gpt-4.1-mini';
  }

  private get timeoutMs() {
    const value = Number(this.config.get<string>('AI_TIMEOUT_MS') ?? 30000);
    return Number.isFinite(value) && value > 0 ? value : 30000;
  }

  private get apiKey() {
    return this.config.get<string>('OPENAI_API_KEY')?.trim() ?? '';
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async healthCheck(): Promise<AiHealthResult> {
    const keyConfigured = this.isConfigured();
    return {
      provider: 'OPENAI',
      model: this.modelName,
      configured: keyConfigured,
      keyConfigured,
      timeoutMs: this.timeoutMs,
      mode: keyConfigured ? 'CLOUD_AI' : 'RULE_BASED_FALLBACK',
      message: keyConfigured
        ? 'OpenAI configurado para analisis cloud.'
        : 'OpenAI no esta configurado. Se usara analisis interno.',
    };
  }

  async askBusinessQuestion(input: BusinessAiInput): Promise<AiProviderResponse> {
    if (!this.isConfigured()) {
      return {
        provider: 'OPENAI',
        mode: 'RULE_BASED_FALLBACK',
        answer: 'OpenAI no esta configurado. Se usara analisis interno.',
        warnings: ['Falta OPENAI_API_KEY en backend.'],
      };
    }

    const startedAt = Date.now();
    const client = new OpenAI({
      apiKey: this.apiKey,
      timeout: this.timeoutMs,
    });

    try {
      const response = await client.responses.create({
        model: this.modelName,
        input: [
          {
            role: 'system',
            content: input.systemPrompt,
          },
          {
            role: 'user',
            content: this.buildUserPrompt(input),
          },
        ],
      });

      const durationMs = Date.now() - startedAt;
      this.logger.log(`OpenAI ok provider=OPENAI model=${this.modelName} durationMs=${durationMs}`);

      return {
        provider: 'OPENAI',
        mode: 'CLOUD_AI',
        answer: response.output_text?.trim() || 'OpenAI no devolvio contenido util.',
        metadata: {
          durationMs,
          model: this.modelName,
          responseId: response.id,
        },
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const mapped = this.mapOpenAiError(error);
      this.logger.warn(
        `OpenAI error provider=OPENAI model=${this.modelName} durationMs=${durationMs} errorType=${mapped.errorType}`,
      );

      return {
        provider: 'OPENAI',
        mode: 'RULE_BASED_FALLBACK',
        answer: mapped.message,
        warnings: [mapped.message],
        metadata: {
          durationMs,
          errorType: mapped.errorType,
        },
      };
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
    if (!health.keyConfigured) {
      return {
        provider: 'OPENAI',
        mode: 'RULE_BASED_FALLBACK',
        answer: health.message,
        warnings: ['OPENAI_API_KEY no esta configurada.'],
        metadata: { ...health },
      };
    }

    const response = await this.askBusinessQuestion({
      question: 'Responde solo: conexion correcta.',
      systemPrompt: 'Eres una prueba tecnica de conexion. No incluyas datos sensibles.',
      businessContext: { purpose: 'health-check' },
    });

    return {
      ...response,
      answer: response.mode === 'CLOUD_AI' ? 'OpenAI conectado correctamente.' : response.answer,
    };
  }

  private buildUserPrompt(input: BusinessAiInput) {
    return [
      `Pregunta del usuario: ${input.question}`,
      '',
      'Contexto empresarial agregado y sanitizado:',
      JSON.stringify(input.businessContext, null, 2),
    ].join('\n');
  }

  private mapOpenAiError(error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: unknown }).status) : undefined;
    const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';
    const name = error instanceof Error ? error.name : 'OpenAIError';

    if (status === 401) {
      return { errorType: 'AUTHENTICATION', message: 'No se pudo autenticar con OpenAI. Verifica OPENAI_API_KEY.' };
    }
    if (status === 429) {
      return { errorType: 'RATE_LIMIT', message: 'Limite de uso de OpenAI alcanzado. Intenta nuevamente.' };
    }
    if (status && status >= 500) {
      return { errorType: 'SERVER_ERROR', message: 'OpenAI no esta disponible temporalmente.' };
    }
    if (code.toLowerCase().includes('timeout') || name.toLowerCase().includes('timeout')) {
      return { errorType: 'TIMEOUT', message: 'OpenAI no respondio dentro del tiempo esperado.' };
    }

    return { errorType: name, message: 'No se pudo consultar OpenAI. Se genero analisis interno.' };
  }
}

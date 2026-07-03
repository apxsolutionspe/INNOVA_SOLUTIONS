import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderResponse } from './ai-provider.interface';

@Injectable()
export class GeminiProvider {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get('AI_API_KEY'));
  }

  async ask(prompt: string): Promise<AiProviderResponse> {
    if (!this.isConfigured()) {
      return { provider: 'GEMINI', mode: 'RULE_BASED_FALLBACK', answer: 'Falta AI_API_KEY. Se usa analisis interno seguro.' };
    }

    const model = this.config.get<string>('AI_MODEL') ?? 'gemini-1.5-flash';
    const apiKey = this.config.get<string>('AI_API_KEY');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      return {
        provider: 'GEMINI',
        mode: 'RULE_BASED_FALLBACK',
        answer: 'No se pudo consultar Gemini. Se recomienda usar el analisis interno mientras se valida la credencial.',
      };
    }

    const data = await response.json();
    return { provider: 'GEMINI', mode: 'CLOUD_AI', answer: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Gemini no devolvio contenido util.' };
  }

  async testConnection(): Promise<AiProviderResponse> {
    return this.isConfigured()
      ? { provider: 'GEMINI', mode: 'CLOUD_AI', answer: 'AI_API_KEY configurada para Gemini.' }
      : { provider: 'GEMINI', mode: 'RULE_BASED_FALLBACK', answer: 'Falta AI_API_KEY para Gemini.' };
  }
}

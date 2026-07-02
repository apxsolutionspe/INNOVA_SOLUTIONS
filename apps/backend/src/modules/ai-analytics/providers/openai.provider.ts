import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderResponse } from './ai-provider.interface';

@Injectable()
export class OpenAiProvider {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get('AI_API_KEY'));
  }

  async ask(prompt: string): Promise<AiProviderResponse> {
    if (!this.isConfigured()) return { mode: 'MOCK', answer: 'Falta AI_API_KEY. Se mantiene respuesta mock segura.' };
    return { mode: 'REAL', answer: `Provider IA configurado. Implementacion real pendiente de cliente oficial. Prompt resumido: ${prompt.slice(0, 160)}` };
  }

  async testConnection(): Promise<AiProviderResponse> {
    return this.isConfigured() ? { mode: 'REAL', answer: 'AI_API_KEY configurada. Listo para conectar provider real.' } : { mode: 'MOCK', answer: 'Falta AI_API_KEY.' };
  }
}

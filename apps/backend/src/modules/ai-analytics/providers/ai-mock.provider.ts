import { Injectable } from '@nestjs/common';
import { AiProviderResponse } from './ai-provider.interface';

@Injectable()
export class AiMockProvider {
  async ask(prompt: string): Promise<AiProviderResponse> {
    return { mode: 'MOCK', answer: `Analisis basado en reglas internas. Consulta resumida: ${prompt.slice(0, 160)}` };
  }

  async testConnection(): Promise<AiProviderResponse> {
    return { mode: 'MOCK', answer: 'Modo mock activo. No se envia informacion a proveedores externos.' };
  }
}

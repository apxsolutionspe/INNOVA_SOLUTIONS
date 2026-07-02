export interface AiProviderResponse {
  mode: 'MOCK' | 'REAL';
  answer: string;
}

export interface AiProviderAdapter {
  ask(prompt: string): Promise<AiProviderResponse>;
  testConnection(): Promise<AiProviderResponse>;
}

export type BusinessAiProviderName = 'OPENAI' | 'GEMINI' | 'RULE_BASED';
export type BusinessAiMode = 'CLOUD_AI' | 'RULE_BASED_FALLBACK' | 'MOCK';

export interface AiHealthResult {
  provider: BusinessAiProviderName;
  model: string;
  configured: boolean;
  keyConfigured: boolean;
  timeoutMs: number;
  mode: BusinessAiMode;
  message: string;
}

export interface BusinessAiInput {
  question: string;
  systemPrompt: string;
  businessContext: Record<string, unknown>;
}

export interface AiProviderResponse {
  provider: BusinessAiProviderName;
  mode: BusinessAiMode;
  answer: string;
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

export interface BusinessAiProvider {
  providerName: BusinessAiProviderName;
  modelName: string;
  healthCheck(): Promise<AiHealthResult>;
  askBusinessQuestion(input: BusinessAiInput): Promise<AiProviderResponse>;
}

export interface AiProviderAdapter {
  ask(prompt: string): Promise<AiProviderResponse>;
  testConnection(): Promise<AiProviderResponse>;
}

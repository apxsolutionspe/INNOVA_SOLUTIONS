export type AiMode = 'MOCK' | 'REAL' | 'LOCAL' | 'LOCAL_RAG' | 'LOCAL_FALLBACK' | 'CLOUD_AI' | 'RULE_BASED_FALLBACK';
export type AiProvider = 'OPENAI' | 'GEMINI' | 'RULE_BASED';

export interface AiAnalysisResult {
  success?: boolean;
  question: string;
  answer: string;
  insights: string[];
  recommendations?: string[];
  sources?: AiSource[];
  mode: AiMode;
  provider?: AiProvider;
  model?: string;
  warnings?: string[];
  metadata?: Record<string, unknown>;
  generatedAt: string;
}

export interface AiInsightResponse {
  success?: boolean;
  provider?: AiProvider;
  mode: AiMode;
  answer: string;
  insights: string[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
  generatedAt: string;
}

export interface AiConnectionStatus {
  success: boolean;
  provider: AiProvider;
  model?: string;
  mode: AiMode;
  configured: boolean;
  keyConfigured: boolean;
  timeoutMs: number;
  answer: string;
  warnings: string[];
  generatedAt: string;
}

export interface AiSource {
  title: string;
  path?: string | null;
  score?: number | null;
  excerpt?: string | null;
}

export interface AiLocalHealth {
  status: string;
  service: string;
  ollama: 'connected' | 'disconnected';
  model: string;
  rag: boolean;
}

export interface AiIndexStatus {
  documents?: number;
  chroma?: string;
  persistDir?: string;
}

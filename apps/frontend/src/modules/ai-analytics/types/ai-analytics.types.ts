export type AiMode = 'MOCK' | 'REAL' | 'LOCAL' | 'LOCAL_RAG' | 'LOCAL_FALLBACK';

export interface AiAnalysisResult {
  question: string;
  answer: string;
  insights: string[];
  recommendations?: string[];
  sources?: AiSource[];
  mode: AiMode;
  model?: string;
  generatedAt: string;
  success?: boolean;
}

export interface AiInsightResponse {
  mode: AiMode;
  answer: string;
  insights: string[];
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

export interface AiLocalSource {
  title: string;
  path?: string | null;
  score?: number | null;
  excerpt?: string | null;
}

export interface AiLocalResponse {
  success: boolean;
  answer: string;
  insights: string[];
  recommendations: string[];
  sources: AiLocalSource[];
  model: string;
  mode: string;
}

export interface AiLocalHealth {
  status: string;
  service: string;
  ollama: 'connected' | 'disconnected';
  model: string;
  rag: boolean;
}

import { FileText } from 'lucide-react';
import { AiSource } from '../types/ai-analytics.types';

export function AiSourcesPanel({ sources }: { sources: AiSource[] }) {
  if (!sources.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <FileText size={17} />
        Fuentes RAG utilizadas
      </div>
      <div className="grid gap-2">
        {sources.map((source, index) => (
          <div key={`${source.title}-${index}`} className="rounded-lg bg-white p-3 text-sm shadow-sm">
            <p className="font-bold text-slate-800">{source.title}</p>
            {source.path ? <p className="mt-1 truncate text-xs text-slate-400">{source.path}</p> : null}
            {source.excerpt ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{source.excerpt}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

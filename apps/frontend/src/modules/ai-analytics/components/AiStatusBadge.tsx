import { CheckCircle2, Cpu, WifiOff } from 'lucide-react';
import { AiMode, AiProvider } from '../types/ai-analytics.types';

interface AiStatusBadgeProps {
  provider?: AiProvider;
  mode?: AiMode;
}

export function AiStatusBadge({ provider, mode }: AiStatusBadgeProps) {
  const isCloud = (provider === 'GEMINI' || provider === 'OPENAI') && mode === 'CLOUD_AI';
  const isInternal = provider === 'RULE_BASED' || mode === 'RULE_BASED_FALLBACK';
  const Icon = isCloud ? CheckCircle2 : isInternal ? Cpu : WifiOff;
  const label = isCloud ? 'IA conectada' : isInternal ? 'Modo interno' : 'Sin conexión';
  const className = isCloud
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : isInternal
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-slate-50 text-slate-600';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${className}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}


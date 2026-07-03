import { Sparkles } from 'lucide-react';

const suggestions = [
  { label: 'Reposicion', question: 'Que productos debo reponer?' },
  { label: 'Rentabilidad', question: 'Como mejorar la rentabilidad?' },
  { label: 'Caja', question: 'Como esta la caja?' },
  { label: 'Ventas', question: 'Cuales son los productos mas vendidos?' },
  { label: 'Stock bajo', question: 'Que productos tienen stock bajo?' },
  { label: 'Compras', question: 'Que compras debo revisar?' },
  { label: 'Alertas', question: 'Que alertas importantes hay hoy?' },
];

interface AiSuggestionChipsProps {
  onPick: (question: string) => void;
  disabled?: boolean;
}

export function AiSuggestionChips({ onPick, disabled }: AiSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(item.question)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={13} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

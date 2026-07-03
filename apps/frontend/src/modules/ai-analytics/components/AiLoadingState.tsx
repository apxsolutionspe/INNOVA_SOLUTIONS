import { Loader2 } from 'lucide-react';

export function AiLoadingState() {
  return (
    <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5 text-violet-800">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm">
          <Loader2 className="animate-spin" size={20} />
        </div>
        <div>
          <p className="text-sm font-black">Analizando datos del sistema...</p>
          <p className="mt-1 text-xs font-semibold text-violet-600">Esto puede tardar unos segundos.</p>
        </div>
      </div>
    </div>
  );
}

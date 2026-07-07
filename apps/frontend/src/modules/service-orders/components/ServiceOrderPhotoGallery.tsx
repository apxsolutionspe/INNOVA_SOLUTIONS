import { Trash2 } from 'lucide-react';

import type { ServiceOrderPhoto } from '../types/service-order.types';

export function ServiceOrderPhotoGallery({
  photos,
  canEdit,
  onDelete,
}: {
  photos: ServiceOrderPhoto[];
  canEdit?: boolean;
  onDelete?: (photoId: string) => void;
}) {
  if (!photos?.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
        No hay fotos de recepción registradas para esta orden.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">Evidencia fotográfica</h2>
          <p className="text-sm font-semibold text-slate-500">Fotos tomadas durante la recepción del equipo.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{photos.length} foto(s)</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="relative">
              <img src={photo.imageData} alt={photo.fileName ?? 'Foto del equipo'} className="h-40 w-full object-cover" />
              {canEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(photo.id)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
                  aria-label="Eliminar foto"
                >
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>
            <figcaption className="px-3 py-2 text-xs font-bold text-slate-600">
              <span className="block truncate">{photo.fileName ?? 'Evidencia de recepción'}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';

import type { ServiceOrderPhotoPayload } from '../types/service-order.types';

const MAX_FILES = 6;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

export function ServiceOrderPhotoUploader({
  photos,
  onChange,
}: {
  photos: ServiceOrderPhotoPayload[];
  onChange: (photos: ServiceOrderPhotoPayload[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    setError('');
    const selected = Array.from(files);
    if (!selected.length) return;
    if (photos.length + selected.length > MAX_FILES) {
      setError(`Solo puedes adjuntar hasta ${MAX_FILES} fotos.`);
      return;
    }

    const nextPhotos: ServiceOrderPhotoPayload[] = [];
    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Solo se permiten imágenes JPG, PNG o WEBP.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError('Cada imagen debe pesar como máximo 2 MB.');
        return;
      }
      const imageData = await readFileAsDataUrl(file);
      nextPhotos.push({
        imageData,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    }
    onChange([...photos, ...nextPhotos]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition ${
          isDragging ? 'border-brand-blue bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-brand-blue hover:bg-blue-50/60'
        }`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-blue shadow-sm">
          <ImagePlus size={22} />
        </span>
        <span className="mt-3 text-sm font-black text-slate-800">Adjuntar fotos del equipo</span>
        <span className="mt-1 text-xs font-semibold text-slate-500">Arrastra imágenes o selecciona desde tu equipo. Máximo 6 fotos de 2 MB.</span>
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleInputChange} />

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p> : null}

      {photos.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <figure key={`${photo.fileName}-${index}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative">
                <img src={photo.imageData} alt={photo.fileName ?? 'Foto del equipo'} className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
                  aria-label="Quitar foto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <figcaption className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600">
                <Camera size={14} />
                <span className="truncate">{photo.fileName ?? 'Evidencia de recepción'}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}

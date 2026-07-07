import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react';

import { resolveProductImage } from '../utils/product-image';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

interface ProductImageUploaderProps {
  value?: string | null;
  productName?: string;
  onChange: (value: string | null) => void;
  onErrorChange?: (error: string) => void;
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function validateImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WEBP.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'La imagen no debe superar 2 MB.';
  }

  return '';
}

export function ProductImageUploader({ value, productName, onChange, onErrorChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [error, setError] = useState('');
  const previewSrc = resolveProductImage(value);

  const publishError = (message: string) => {
    setError(message);
    onErrorChange?.(message);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      publishError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        publishError('No se pudo cargar la imagen. Intenta nuevamente.');
        return;
      }

      setFileName(file.name);
      setFileSize(formatFileSize(file.size));
      publishError('');
      onChange(reader.result);
    };
    reader.onerror = () => publishError('No se pudo cargar la imagen. Intenta nuevamente.');
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setFileName('');
    setFileSize('');
    publishError('');
    onChange(null);
  };

  return (
    <section className="sm:col-span-2">
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        Imagen del producto
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Seleccionar imagen del producto"
      />
      <button
        type="button"
        onClick={openFilePicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex min-h-[15rem] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-100 ${
          isDragging
            ? 'border-brand-cyan bg-cyan-50 shadow-lg shadow-cyan-100'
            : error
              ? 'border-red-200 bg-red-50/40'
              : 'border-slate-200 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.12),transparent_38%),linear-gradient(135deg,#ffffff,#f8fafc)] hover:border-brand-cyan hover:bg-cyan-50/40'
        }`}
        aria-label={previewSrc ? 'Cambiar imagen del producto' : 'Agregar imagen del producto'}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt={productName ? `Imagen de ${productName}` : 'Vista previa del producto'}
              className="h-44 max-h-44 w-full object-contain p-2"
            />
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-brand-blue shadow-sm ring-1 ring-cyan-100">
              <RefreshCw size={14} />
              Cambiar imagen
            </span>
          </>
        ) : (
          <div className="grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-blue via-brand-cyan to-brand-violet text-white shadow-lg shadow-cyan-200/70">
              {isDragging ? <UploadCloud size={30} /> : <ImagePlus size={30} />}
            </span>
            <p className="mt-4 text-base font-black text-slate-950">
              {isDragging ? 'Suelta la imagen aqui' : 'Agregar imagen'}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Haz clic o arrastra una imagen aqui</p>
            <p className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              JPG, PNG o WEBP - maximo 2 MB
            </p>
          </div>
        )}
      </button>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-xs font-semibold text-slate-500">
          {fileName ? (
            <p className="truncate">
              {fileName} <span className="text-slate-400">({fileSize})</span>
            </p>
          ) : previewSrc ? (
            <p>Imagen actual del producto</p>
          ) : (
            <p>La imagen se mostrara en Inventario y POS.</p>
          )}
        </div>

        {previewSrc ? (
          <button
            type="button"
            onClick={removeImage}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            <Trash2 size={14} />
            Quitar
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
    </section>
  );
}

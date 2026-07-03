import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

interface ModalProps {
  title: string;
  description?: string;
  size?: ModalSize;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({ title, description, size = 'md', footer, onClose, children }: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        className={cn('relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]', sizes[size])}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-cyan-100">
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
        {footer ? <footer className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-5">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="secondary" onClick={onClick}>Cancelar</Button>;
}

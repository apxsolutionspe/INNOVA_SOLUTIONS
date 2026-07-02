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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <section className={cn('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl', sizes[size])}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="secondary" onClick={onClick}>Cancelar</Button>;
}

import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmTone = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  title: string;
  message: string;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, tone = 'warning', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onClose }: ConfirmDialogProps) {
  const Icon = tone === 'info' ? Info : AlertTriangle;
  const variant = tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'primary';
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onClose}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          <Button type="button" variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}
    >
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700">
          <Icon size={22} />
        </div>
        <p className="text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

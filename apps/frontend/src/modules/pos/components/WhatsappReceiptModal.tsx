import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clipboard, ExternalLink, FileText, Link2, Loader2, MessageCircle, Send, X } from 'lucide-react';

import { Sale } from '../../sales/types/sale.types';
import { SendReceiptResponse, whatsappReceiptService } from '../services/whatsapp-receipt.service';

interface WhatsappReceiptModalProps {
  sale: Sale;
  defaultPhone?: string | null;
  onClose: () => void;
}

function onlyDigits(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

function normalizeWhatsappPhone(phone: string) {
  const digits = onlyDigits(phone);
  return digits.length === 9 ? `51${digits}` : digits;
}

function isValidPhone(phone: string) {
  const normalized = normalizeWhatsappPhone(phone);
  return normalized.length >= 11 && normalized.length <= 15;
}

function formatSaleDate(dateValue: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function buildManualMessage(sale: Sale) {
  return [
    `Hola ${sale.customer?.fullName ?? 'Cliente general'}, gracias por tu compra en Innova Solutions.`,
    '',
    `Comprobante: ${sale.code}`,
    `Total: S/ ${sale.total.toFixed(2)}`,
    '',
    'Gracias por confiar en nosotros.',
  ].join('\n');
}

function toUserError(error?: string) {
  if (!error) return 'No se pudo generar el enlace del comprobante.';
  const normalized = error.toLowerCase();
  if (normalized.includes('telefono') || normalized.includes('whatsapp') || normalized.includes('numero')) {
    return 'Numero de WhatsApp invalido.';
  }
  if (normalized.includes('comprobante') || normalized.includes('venta')) return error;
  return 'No se pudo generar el enlace del comprobante.';
}

interface ReceiptShareState {
  receiptUrl: string;
  whatsappUrl?: string;
  message: string;
  mode?: string;
  status?: string;
  deliveryConfirmed?: boolean;
  manualSendRequired?: boolean;
  providerMessageId?: string;
}

export function WhatsappReceiptModal({ sale, defaultPhone, onClose }: WhatsappReceiptModalProps) {
  const [phone, setPhone] = useState(defaultPhone ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [receiptLink, setReceiptLink] = useState<ReceiptShareState | null>(null);

  const saleDate = useMemo(() => formatSaleDate(sale.createdAt), [sale.createdAt]);
  const normalizedPhone = normalizeWhatsappPhone(phone);
  const canUsePhone = isValidPhone(phone);
  const customerName = sale.customer?.fullName ?? 'Cliente general';
  const manualMessage = receiptLink?.message ?? buildManualMessage(sale);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  async function generateReceiptLink(requirePhone = true) {
    if (requirePhone && !canUsePhone) {
      setError('Numero de WhatsApp invalido.');
      return null;
    }

    setIsGenerating(true);
    setError('');
    setStatusMessage('Generando comprobante...');

    try {
      const response = await whatsappReceiptService.createReceiptLink({
        type: 'SALE',
        id: sale.id,
        phone: canUsePhone ? phone : undefined,
      });
      setReceiptLink({
        receiptUrl: response.receiptUrl,
        whatsappUrl: response.whatsappUrl,
        message: response.message,
        mode: 'link',
        status: 'READY_TO_SEND',
        deliveryConfirmed: false,
        manualSendRequired: true,
      });
      setStatusMessage('Comprobante generado correctamente.');
      return {
        receiptUrl: response.receiptUrl,
        whatsappUrl: response.whatsappUrl,
        message: response.message,
      };
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : undefined;
      setError(toUserError(message));
      setStatusMessage('');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUsePhone) {
      setError('Numero de WhatsApp invalido.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setStatusMessage('Enviando comprobante...');

    try {
      const response = await whatsappReceiptService.sendReceipt({
        type: 'SALE',
        id: sale.id,
        phone,
      });
      handleSendReceiptResponse(response);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : undefined;
      setError(toUserError(message));
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSendReceiptResponse(response: SendReceiptResponse) {
    if (!response.success && response.status === 'ERROR') {
      setError(response.details ?? response.message ?? 'No se pudo enviar el comprobante.');
      return;
    }

    setReceiptLink({
      receiptUrl: response.receiptUrl ?? '',
      whatsappUrl: response.whatsappUrl,
      message: response.message,
      mode: response.mode,
      status: response.status,
      deliveryConfirmed: response.deliveryConfirmed,
      manualSendRequired: response.manualSendRequired,
      providerMessageId: response.providerMessageId,
    });

    if (response.deliveryConfirmed) {
      setStatusMessage('Comprobante enviado. WhatsApp acepto el envio del documento.');
      return;
    }

    setStatusMessage('Comprobante listo. Abre WhatsApp para enviarlo manualmente.');
    if (response.whatsappUrl) {
      const opened = window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!opened) setStatusMessage('Comprobante listo. Si WhatsApp no se abre, copia el mensaje manualmente.');
    }
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(success);
    } catch {
      setError('No se pudo copiar automaticamente. Selecciona el texto manualmente.');
    }
  }

  async function copyMessage() {
    const response = receiptLink ?? (await generateReceiptLink(false));
    await copyText(response?.message ?? manualMessage, 'Mensaje copiado.');
  }

  async function copyReceiptLink() {
    const response = receiptLink ?? (await generateReceiptLink(false));
    if (!response) return;
    await copyText(response.receiptUrl, 'Enlace del comprobante copiado.');
  }

  async function handleFallbackOpen() {
    if (receiptLink?.deliveryConfirmed && receiptLink.receiptUrl) {
      window.open(receiptLink.receiptUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!canUsePhone) {
      setError('Numero de WhatsApp invalido.');
      return;
    }
    const response = receiptLink ?? (await generateReceiptLink(true));
    if (!response?.whatsappUrl) return;
    window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  function resetForPhoneChange(value: string) {
    setPhone(value);
    setReceiptLink(null);
    setError('');
    setStatusMessage('');
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true" aria-label="Enviar comprobante por WhatsApp">
      <button type="button" aria-label="Cerrar envio por WhatsApp" className="absolute inset-0 cursor-default" onClick={onClose} />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
      >
        <div className="border-b border-emerald-700/20 bg-[linear-gradient(135deg,#075e54,#128c7e)] px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <MessageCircle size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black leading-tight">Enviar comprobante por WhatsApp</h2>
                <p className="mt-1 text-sm font-semibold text-emerald-50">
                  Venta {sale.code} - S/ {sale.total.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/12 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          <label className="block">
            <span className="text-sm font-black text-slate-900">Numero de WhatsApp</span>
            <input
              value={phone}
              onChange={(event) => resetForPhoneChange(event.target.value)}
              placeholder="Ej. 987654321 o +51 987 654 321"
              inputMode="tel"
              className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:ring-4 ${
                phone && !canUsePhone
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
              }`}
            />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Acepta 9 digitos, +51, espacios o guiones.
            </p>
            {phone ? (
              <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                Se enviara a: {normalizedPhone}
              </p>
            ) : null}
          </label>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <FileText size={21} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Comprobante PDF por WhatsApp</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                  El sistema intentara enviar el PDF por WhatsApp Cloud API. Si Meta rechaza el envio, se generara enlace manual.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Resumen</p>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
                {receiptLink?.deliveryConfirmed ? 'Cloud API' : 'Fallback link'}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-slate-400">Cliente</dt>
                <dd className="mt-1 truncate font-bold text-slate-800">{customerName}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-slate-400">Comprobante</dt>
                <dd className="mt-1 font-bold text-slate-800">{sale.code}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-slate-400">Total</dt>
                <dd className="mt-1 font-bold text-emerald-700">S/ {sale.total.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-slate-400">Fecha</dt>
                <dd className="mt-1 font-bold text-slate-800">{saleDate}</dd>
              </div>
            </dl>
          </section>

          {receiptLink ? (
            <section className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Enlace del comprobante</p>
              <p className="mt-2 break-all text-sm font-bold leading-6 text-cyan-900">{receiptLink.receiptUrl}</p>
              {receiptLink.providerMessageId ? (
                <p className="mt-2 text-xs font-black text-cyan-700">Meta message id: {receiptLink.providerMessageId}</p>
              ) : null}
            </section>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">
              {error}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <span>{statusMessage}</span>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {isGenerating ? 'Enviando...' : 'Enviar comprobante'}
            </button>
            <button
              type="button"
              onClick={() => void handleFallbackOpen()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ExternalLink size={18} />
              {receiptLink?.deliveryConfirmed ? 'Ver comprobante' : 'Abrir WhatsApp'}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void copyMessage()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              <Clipboard size={17} />
              Copiar mensaje
            </button>
            <button
              type="button"
              onClick={() => void copyReceiptLink()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              <Link2 size={17} />
              Copiar enlace
            </button>
          </div>

          <p className="text-xs font-semibold leading-5 text-slate-500">
            Si WhatsApp Cloud API no confirma el envio, usa el fallback manual. El link del comprobante no requiere iniciar sesion.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl border border-slate-200 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </motion.form>
    </div>
  );
}

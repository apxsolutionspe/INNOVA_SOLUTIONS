import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, FileText, Loader2, MessageCircle, Send, X } from 'lucide-react';

import { Sale } from '../../sales/types/sale.types';
import { whatsappReceiptService } from '../services/whatsapp-receipt.service';

interface WhatsappReceiptModalProps {
  sale: Sale;
  defaultPhone?: string | null;
  onClose: () => void;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

function normalizeWhatsappPhone(phone: string) {
  const digits = normalizePhone(phone);
  return digits.length === 9 ? `51${digits}` : digits;
}

function isValidPhone(phone: string) {
  const normalized = normalizeWhatsappPhone(phone);
  return normalized.length >= 11 && normalized.length <= 15;
}

function toWhatsappUserError(rawError?: string) {
  const fallback = 'No se pudo enviar el comprobante PDF. Revisa token, plantilla o conexion con Meta.';
  if (!rawError) return fallback;

  const normalized = rawError.toLowerCase();
  if (normalized.includes('authentication') || normalized.includes('oauth') || normalized.includes('token')) {
    return 'Token invalido o vencido. Genera un nuevo token en Meta Developer y reinicia el backend.';
  }
  if (normalized.includes('plantilla') || normalized.includes('template')) {
    return rawError;
  }
  if (normalized.includes('numero') || normalized.includes('phone') || normalized.includes('recipient')) {
    return 'Numero de WhatsApp invalido o no autorizado para pruebas.';
  }

  return rawError;
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

function buildPreviewMessage(sale: Sale) {
  const date = formatSaleDate(sale.createdAt);

  return [
    'Hola, gracias por tu compra en Innova Solutions.',
    '',
    `Comprobante: ${sale.code}`,
    `Total: S/ ${sale.total.toFixed(2)}`,
    `Fecha: ${date}`,
    'Estado: Venta registrada correctamente.',
    '',
    'Puedes revisar tu comprobante solicitandolo en tienda.',
    '',
    'Gracias por confiar en nosotros.',
  ].join('\n');
}

export function WhatsappReceiptModal({ sale, defaultPhone, onClose }: WhatsappReceiptModalProps) {
  const [phone, setPhone] = useState(normalizePhone(defaultPhone ?? ''));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const previewMessage = useMemo(() => buildPreviewMessage(sale), [sale]);
  const saleDate = useMemo(() => formatSaleDate(sale.createdAt), [sale.createdAt]);
  const normalizedPhone = normalizeWhatsappPhone(phone);
  const canUsePhone = isValidPhone(phone);
  const customerName = sale.customer?.fullName ?? 'Cliente general';
  const filename = `comprobante-${sale.code}.pdf`;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!canUsePhone) {
      setError('Ingresa un numero de WhatsApp valido.');
      return;
    }

    setIsSending(true);
    try {
      const response = await whatsappReceiptService.sendSaleReceipt({
        saleId: sale.id,
        phone: normalizedPhone,
        documentType: 'COMPROBANTE',
        sendPdf: true,
        sendStrategy: 'receipt_pdf',
        mode: 'receipt_pdf',
      });
      if (!response.success) {
        setError(toWhatsappUserError(response.error || response.data.errorMessage || response.message));
        return;
      }
      setSuccessMessage('Comprobante PDF enviado correctamente.');
    } catch (sendError) {
      setError(toWhatsappUserError(sendError instanceof Error ? sendError.message : undefined));
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsapp = () => {
    if (!canUsePhone) {
      setError('Ingresa un numero de WhatsApp valido.');
      return;
    }

    const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(previewMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
              onChange={(event) => {
                setPhone(event.target.value);
                setError('');
                setSuccessMessage('');
              }}
              placeholder="Ej. 51999999999"
              inputMode="numeric"
              className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:ring-4 ${
                phone && !canUsePhone
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
              }`}
            />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Puedes ingresar 9 digitos o el numero con codigo de pais.
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
                <p className="text-sm font-black text-slate-900">Comprobante PDF</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                  Se enviara el comprobante en PDF usando la plantilla aprobada de WhatsApp.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Resumen del envio</p>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">PDF</span>
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
              <div className="sm:col-span-2">
                <dt className="text-xs font-black uppercase tracking-wide text-slate-400">Archivo</dt>
                <dd className="mt-1 truncate font-bold text-slate-800">{filename}</dd>
              </div>
            </dl>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <span>
                {successMessage}
                <span className="mt-1 block text-xs font-semibold text-emerald-600">WhatsApp confirmo la recepcion de la solicitud.</span>
              </span>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {isSending ? 'Enviando comprobante...' : 'Enviar PDF por WhatsApp'}
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsapp}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ExternalLink size={18} />
              Abrir WhatsApp
            </button>
          </div>

          <p className="text-xs font-semibold leading-5 text-slate-500">
            Alternativa manual si el envio automatico no esta disponible.
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

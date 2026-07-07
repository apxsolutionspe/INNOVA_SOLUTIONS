import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ClipboardCheck, FileText, MessageCircle, MonitorCog, UserRound, Wrench, X } from 'lucide-react';

import { Button } from '../../../components/ui';
import { customersService } from '../../customers/services/customers.service';
import { Customer } from '../../customers/types/customer.types';
import { serviceOrdersService } from '../services/service-orders.service';
import { CreateServiceOrderPayload, ServiceOrderPhotoPayload } from '../types/service-order.types';
import { ServiceOrderPhotoUploader } from './ServiceOrderPhotoUploader';
import { ServiceOrderReceiptModal } from './ServiceOrderReceiptModal';

type FieldErrors = Partial<Record<keyof CreateServiceOrderPayload, string>>;
type SubmitAction = 'save' | 'ticket' | 'whatsapp';

const initialForm: CreateServiceOrderPayload = {
  customerId: '',
  equipmentType: '',
  brand: '',
  model: '',
  serialNumber: '',
  color: '',
  physicalCondition: '',
  accessoriesReceived: '',
  reportedIssue: '',
  initialDiagnosis: '',
  receptionNotes: '',
  estimatedDeliveryDate: '',
  notes: '',
  photos: [],
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function validate(form: CreateServiceOrderPayload) {
  const errors: FieldErrors = {};
  if (!form.customerId) errors.customerId = 'Selecciona un cliente.';
  if (!form.equipmentType.trim()) errors.equipmentType = 'Indica el tipo de equipo.';
  if (!form.brand?.trim()) errors.brand = 'Indica la marca.';
  if (!form.model?.trim()) errors.model = 'Indica el modelo.';
  if (form.estimatedDeliveryDate && Number.isNaN(new Date(form.estimatedDeliveryDate).getTime())) {
    errors.estimatedDeliveryDate = 'La fecha estimada no es válida.';
  }
  if (!form.reportedIssue.trim()) {
    errors.reportedIssue = 'Describe la falla reportada.';
  } else if (form.reportedIssue.trim().length < 8) {
    errors.reportedIssue = 'Describe la falla con más detalle.';
  }
  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

function SectionTitle({ icon: Icon, title, description }: { icon: typeof UserRound; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-brand-blue">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="text-xs font-semibold text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function ServiceOrderForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const firstFieldRef = useRef<HTMLSelectElement | null>(null);
  const submitActionRef = useRef<SubmitAction>('save');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CreateServiceOrderPayload>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [receiptHtml, setReceiptHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    firstFieldRef.current?.focus();
    void customersService
      .findAll({ page: 1, limit: 100 })
      .then((response) => setCustomers(response.items))
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los clientes.'));
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customerId),
    [customers, form.customerId],
  );

  const update = <TKey extends keyof CreateServiceOrderPayload>(key: TKey, value: CreateServiceOrderPayload[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError('');
    setSuccessMessage('');
  };

  const updatePhotos = (photos: ServiceOrderPhotoPayload[]) => {
    update('photos', photos);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const action = submitActionRef.current;
    setIsSaving(true);
    setSubmitError('');
    setSuccessMessage('');
    try {
      const created = await serviceOrdersService.create(form);
      await onCreated();
      setForm(initialForm);

      if (action === 'ticket') {
        const ticket = await serviceOrdersService.ticket(created.id);
        setReceiptHtml(ticket.html);
        setSuccessMessage(`Orden ${created.code} registrada. La constancia está lista para imprimir.`);
      } else if (action === 'whatsapp') {
        const response = await serviceOrdersService.sendWhatsApp(created.id);
        if (response.whatsappUrl) {
          window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
        }
        setSuccessMessage(response.message || `Orden ${created.code} registrada. Se preparó el envío por WhatsApp.`);
      } else {
        setSuccessMessage(`Orden ${created.code} registrada correctamente.`);
        onClose();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo crear la orden técnica.');
    } finally {
      setIsSaving(false);
      submitActionRef.current = 'save';
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4" role="dialog" aria-modal="true" aria-label="Nueva orden técnica">
      <form onSubmit={submit} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-5 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Recepción profesional</p>
            <h2 className="mt-1 text-2xl font-black">Nueva orden técnica</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Registra el equipo recibido, estado físico, accesorios, diagnóstico inicial y evidencia fotográfica.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 text-slate-200 transition hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-5 py-5 sm:px-6">
          {loadError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loadError}</div> : null}
          {submitError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{submitError}</div> : null}
          {successMessage ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{successMessage}</div> : null}

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={UserRound} title="Cliente" description="Titular responsable del equipo recibido." />
            <div>
              <select
                ref={firstFieldRef}
                value={form.customerId}
                onChange={(event) => update('customerId', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
              </select>
              <FieldError message={errors.customerId} />
              {selectedCustomer ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {selectedCustomer.phone || 'Sin teléfono'} · {selectedCustomer.documentNumber || 'Sin documento'}
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={MonitorCog} title="Datos del equipo" description="Información necesaria para identificar el equipo durante el servicio." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Tipo de equipo</span>
                <input value={form.equipmentType} onChange={(event) => update('equipmentType', event.target.value)} placeholder="Laptop, PC, impresora..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.equipmentType} />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Marca</span>
                <input value={form.brand ?? ''} onChange={(event) => update('brand', event.target.value)} placeholder="Lenovo, HP, Epson..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.brand} />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Modelo</span>
                <input value={form.model ?? ''} onChange={(event) => update('model', event.target.value)} placeholder="IdeaPad 3, L3150..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.model} />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Número de serie</span>
                <input value={form.serialNumber ?? ''} onChange={(event) => update('serialNumber', event.target.value)} placeholder="Opcional" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Color</span>
                <input value={form.color ?? ''} onChange={(event) => update('color', event.target.value)} placeholder="Negro, gris, blanco..." className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Fecha estimada de entrega</span>
                <input type="date" min={today()} value={form.estimatedDeliveryDate ?? ''} onChange={(event) => update('estimatedDeliveryDate', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.estimatedDeliveryDate} />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={ClipboardCheck} title="Estado de recepción" description="Deja constancia del estado físico y accesorios entregados." />
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Estado físico del equipo</span>
                <textarea value={form.physicalCondition ?? ''} onChange={(event) => update('physicalCondition', event.target.value)} placeholder="Rayones, golpes, pantalla dañada, carcasa abierta..." className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Accesorios recibidos</span>
                <textarea value={form.accessoriesReceived ?? ''} onChange={(event) => update('accessoriesReceived', event.target.value)} placeholder="Cargador, cable USB, funda, cartuchos, mouse..." className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={Wrench} title="Diagnóstico inicial" description="Registra lo reportado por el cliente y la primera revisión." />
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Falla reportada</span>
                <textarea value={form.reportedIssue} onChange={(event) => update('reportedIssue', event.target.value)} placeholder="Describe el problema indicado por el cliente." className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.reportedIssue} />
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Diagnóstico inicial</span>
                <textarea value={form.initialDiagnosis ?? ''} onChange={(event) => update('initialDiagnosis', event.target.value)} placeholder="Pruebas rápidas, síntomas observados, posible causa..." className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-black uppercase text-slate-400">Notas de recepción</span>
                <textarea value={form.receptionNotes ?? ''} onChange={(event) => update('receptionNotes', event.target.value)} placeholder="Condiciones de entrega, autorización del cliente, observaciones internas..." className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle icon={FileText} title="Evidencia fotográfica" description="Adjunta fotos del estado del equipo al momento de recibirlo." />
            <ServiceOrderPhotoUploader photos={form.photos ?? []} onChange={updatePhotos} />
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-semibold text-slate-500">Puedes generar una constancia o preparar el envío por WhatsApp al guardar.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" variant="secondary" disabled={isSaving} onClick={() => { submitActionRef.current = 'ticket'; }}>
              <FileText size={16} />
              Guardar y ver ticket
            </Button>
            <Button type="submit" variant="secondary" disabled={isSaving} onClick={() => { submitActionRef.current = 'whatsapp'; }}>
              <MessageCircle size={16} />
              Guardar y enviar por WhatsApp
            </Button>
            <Button type="submit" disabled={isSaving} onClick={() => { submitActionRef.current = 'save'; }}>
              {isSaving ? 'Guardando...' : 'Guardar orden'}
            </Button>
          </div>
        </div>
      </form>

      {receiptHtml ? <ServiceOrderReceiptModal html={receiptHtml} onClose={() => setReceiptHtml('')} /> : null}
    </div>
  );
}

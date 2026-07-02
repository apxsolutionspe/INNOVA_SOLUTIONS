import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, UserRound, Wrench, X } from 'lucide-react';

import { Button } from '../../../components/ui';
import { customersService } from '../../customers/services/customers.service';
import { Customer } from '../../customers/types/customer.types';
import { serviceOrdersService } from '../services/service-orders.service';
import { CreateServiceOrderPayload } from '../types/service-order.types';

type FieldErrors = Partial<Record<keyof CreateServiceOrderPayload, string>>;

const initialForm: CreateServiceOrderPayload = {
  customerId: '',
  equipmentType: '',
  brand: '',
  model: '',
  serialNumber: '',
  reportedIssue: '',
  estimatedDeliveryDate: '',
  notes: '',
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
    errors.estimatedDeliveryDate = 'La fecha estimada no es valida.';
  }
  if (!form.reportedIssue.trim()) {
    errors.reportedIssue = 'Describe la falla reportada.';
  } else if (form.reportedIssue.trim().length < 8) {
    errors.reportedIssue = 'Describe la falla con mas detalle.';
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CreateServiceOrderPayload>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
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
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    setSubmitError('');
    try {
      await serviceOrdersService.create(form);
      setForm(initialForm);
      await onCreated();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo crear la orden tecnica.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4" role="dialog" aria-modal="true" aria-label="Nueva orden tecnica">
      <form onSubmit={submit} className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-brand-blue">Recepcion de equipo</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Nueva orden tecnica</h2>
            <p className="mt-1 text-sm text-slate-500">Registra la recepcion del equipo y la falla reportada.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {loadError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loadError}</div> : null}
          {submitError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{submitError}</div> : null}

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <SectionTitle icon={UserRound} title="Cliente" description="Selecciona el titular de la orden tecnica." />
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
              {selectedCustomer ? <p className="mt-2 text-xs font-semibold text-slate-500">{selectedCustomer.phone || 'Sin telefono'} · {selectedCustomer.documentNumber || 'Sin documento'}</p> : null}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <SectionTitle icon={Wrench} title="Datos del equipo" description="Identifica el equipo recibido para el seguimiento." />
            <div className="grid gap-4 sm:grid-cols-2">
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
                <span className="text-xs font-black uppercase text-slate-400">Serie</span>
                <input value={form.serialNumber ?? ''} onChange={(event) => update('serialNumber', event.target.value)} placeholder="Opcional" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <SectionTitle icon={CalendarDays} title="Recepcion y problema" description="Define la fecha estimada y el detalle reportado." />
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase text-slate-400">Fecha estimada de entrega</span>
                <input type="date" min={today()} value={form.estimatedDeliveryDate ?? ''} onChange={(event) => update('estimatedDeliveryDate', event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.estimatedDeliveryDate} />
              </label>
              <div>
                <span className="text-xs font-black uppercase text-slate-400">Estado inicial</span>
                <div className="mt-1 inline-flex h-11 items-center rounded-full bg-blue-50 px-4 text-sm font-black text-blue-700">Recibido</div>
              </div>
              <label className="sm:col-span-2">
                <span className="text-xs font-black uppercase text-slate-400">Falla reportada</span>
                <textarea value={form.reportedIssue} onChange={(event) => update('reportedIssue', event.target.value)} placeholder="Describe el problema indicado por el cliente." className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                <FieldError message={errors.reportedIssue} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-black uppercase text-slate-400">Observaciones</span>
                <textarea value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} placeholder="Accesorios recibidos, estado fisico, indicaciones adicionales..." className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar orden'}</Button>
        </div>
      </form>
    </div>
  );
}

import { FormEvent, useEffect, useState } from 'react';
import { Building2, CheckCircle2, Search, UserRound } from 'lucide-react';

import { Button, FormGrid, Input, Modal, Select, Textarea } from '../../../components/ui';
import { documentLookupService } from '../../../services/documentLookupService';
import { Customer, CustomerPayload, CustomerType, DocumentType } from '../types/customer.types';

const naturalDocumentTypes: DocumentType[] = ['DNI', 'CE', 'PASSPORT', 'OTHER'];

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
  onClose: () => void;
}

const emptyForm: CustomerPayload = {
  customerType: 'NATURAL',
  documentType: 'DNI',
  documentNumber: '',
  fullName: '',
  firstName: '',
  lastName: '',
  businessName: '',
  tradeName: '',
  legalRepresentative: '',
  phone: '',
  email: '',
  address: '',
  businessLine: '',
  notes: '',
  isActive: true,
};

const normalizeLookupMessage = (message: string | undefined, fallback: string) => {
  if (!message) return fallback;
  const normalized = message.toLowerCase();

  if (normalized.includes('timeout') || normalized.includes('respondio a tiempo') || normalized.includes('respondió a tiempo') || normalized.includes('no respondio') || normalized.includes('no respondió')) {
    return 'Json.pe no respondió dentro del tiempo esperado. Intenta nuevamente.';
  }

  return message;
};

export function CustomerForm({ customer, onSubmit, onClose }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerPayload>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'success' | 'warning' | 'error' | ''>('');
  const [error, setError] = useState('');
  const isCompany = form.customerType === 'COMPANY';
  const documentNumber = form.documentNumber.trim();
  const canLookupDni = !isCompany && form.documentType === 'DNI' && /^\d{8}$/.test(documentNumber);
  const canLookupRuc = isCompany && /^\d{11}$/.test(documentNumber);

  useEffect(() => {
    setForm(
      customer
        ? {
            customerType: customer.customerType ?? 'NATURAL',
            documentType: customer.documentType,
            documentNumber: customer.documentNumber,
            fullName: customer.fullName,
            firstName: customer.firstName ?? '',
            lastName: customer.lastName ?? '',
            businessName: customer.businessName ?? '',
            tradeName: customer.tradeName ?? '',
            legalRepresentative: customer.legalRepresentative ?? '',
            phone: customer.phone ?? '',
            email: customer.email ?? '',
            address: customer.address ?? '',
            businessLine: customer.businessLine ?? '',
            notes: customer.notes ?? '',
            isActive: customer.isActive,
          }
        : emptyForm,
    );
  }, [customer]);

  const update = (key: keyof CustomerPayload, value: string | boolean) => {
    setError('');
    setLookupMessage('');
    setLookupStatus('');
    setForm((current) => ({ ...current, [key]: value }));
  };

  const changeType = (customerType: CustomerType) => {
    setError('');
    setLookupMessage('');
    setLookupStatus('');
    setForm((current) => ({
      ...current,
      customerType,
      documentType: customerType === 'COMPANY' ? 'RUC' : 'DNI',
      documentNumber: '',
    }));
  };

  const handleDocumentLookup = async () => {
    setError('');
    setLookupMessage('');
    setLookupStatus('');

    if (isCompany && !canLookupRuc) {
      setLookupStatus('error');
      setLookupMessage('El RUC debe tener exactamente 11 dígitos numéricos.');
      return;
    }

    if (!isCompany && form.documentType !== 'DNI') {
      setLookupStatus('error');
      setLookupMessage('La consulta automatica esta disponible para DNI.');
      return;
    }

    if (!isCompany && !canLookupDni) {
      setLookupStatus('error');
      setLookupMessage('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }

    setIsLookingUp(true);
    try {
      if (isCompany) {
        const result = await documentLookupService.lookupRuc(documentNumber);
        if (!result.success || !result.data) {
          setLookupStatus(result.message?.toLowerCase().includes('configur') ? 'error' : 'warning');
          setLookupMessage(normalizeLookupMessage(result.message, 'No se encontró información para el documento consultado.'));
          return;
        }

        const data = result.data;
        setForm((current) => ({
          ...current,
          documentType: 'RUC',
          documentNumber: data.ruc,
          businessName: data.businessName || current.businessName,
          address: data.fullAddress ?? data.address ?? current.address,
          businessLine: [data.status, data.condition].filter(Boolean).join(' / ') || current.businessLine,
          fullName: data.businessName || current.fullName,
          isActive: data.status?.toUpperCase() === 'ACTIVO' ? true : current.isActive,
        }));
        setLookupStatus('success');
        setLookupMessage('Datos encontrados y completados correctamente.');
        return;
      }

      const result = await documentLookupService.lookupDni(documentNumber);
      if (!result.success || !result.data) {
        setLookupStatus(result.message?.toLowerCase().includes('configur') ? 'error' : 'warning');
        setLookupMessage(normalizeLookupMessage(result.message, 'No se encontró información para el documento consultado.'));
        return;
      }

      const data = result.data;
      setForm((current) => ({
        ...current,
        documentType: 'DNI',
        documentNumber: data.dni,
        firstName: data.firstName || current.firstName,
        lastName: data.surnames || [data.paternalSurname, data.maternalSurname].filter(Boolean).join(' ') || current.lastName,
        fullName: data.fullName || current.fullName,
        address: data.fullAddress ?? data.address ?? current.address,
      }));
      setLookupStatus('success');
      setLookupMessage('Datos encontrados y completados correctamente.');
    } catch (lookupError) {
      setLookupStatus('error');
      setLookupMessage(normalizeLookupMessage(lookupError instanceof Error ? lookupError.message : undefined, 'No se pudo consultar el documento.'));
    } finally {
      setIsLookingUp(false);
    }
  };

  const lookupFeedback = lookupMessage ? (
    <div
      className={`rounded-xl border px-4 py-3 text-xs font-bold ${
        lookupStatus === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : lookupStatus === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {lookupMessage}
    </div>
  ) : null;

  const lookupButton = (
    <Button
      type="button"
      aria-label={isCompany ? 'Consultar RUC' : 'Consultar DNI'}
      variant="secondary"
      size="sm"
      onClick={handleDocumentLookup}
      disabled={isLookingUp || (isCompany ? !canLookupRuc : !canLookupDni)}
      className="h-11 shrink-0 border-blue-100 bg-blue-50 px-3 text-blue-700 hover:border-blue-200 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
    >
      {isLookingUp ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" aria-hidden="true" />
      ) : lookupStatus === 'success' ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <Search size={16} aria-hidden="true" />
      )}
      {isLookingUp ? 'Consultando...' : isCompany ? 'Consultar RUC' : 'Consultar DNI'}
    </Button>
  );

  const dniInlineMessage = !isCompany && form.documentType === 'DNI' && documentNumber.length > 0 && !canLookupDni
    ? 'El DNI debe tener exactamente 8 dígitos numéricos.'
    : '';

  const validate = () => {
    if (isCompany) {
      if (!form.documentNumber.trim() || form.documentNumber.trim().length !== 11) return 'El RUC debe tener exactamente 11 dígitos numéricos.';
      if (!form.businessName?.trim()) return 'La razon social es obligatoria.';
      return '';
    }
    if (!form.documentNumber.trim()) return 'El documento es obligatorio.';
    if (!form.firstName?.trim()) return 'Los nombres son obligatorios.';
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        ...form,
        documentType: isCompany ? 'RUC' : form.documentType,
        fullName: isCompany ? form.businessName : [form.firstName, form.lastName].filter(Boolean).join(' '),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={customer ? 'Editar cliente' : 'Nuevo cliente'}
      description="Registra personas naturales o empresas para ventas, servicios y facturacion."
      size="lg"
      onClose={onClose}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="customer-form" disabled={isSaving}>{isSaving ? 'Guardando...' : customer ? 'Actualizar cliente' : 'Guardar cliente'}</Button>
        </>
      )}
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => changeType('NATURAL')}
            className={`rounded-2xl border p-4 text-left transition ${
              !isCompany ? 'border-cyan-300 bg-cyan-50 text-cyan-800 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'
            }`}
          >
            <UserRound size={21} />
            <p className="mt-2 text-sm font-black">Persona natural</p>
            <p className="mt-1 text-xs leading-5">DNI, CE, pasaporte u otro documento personal.</p>
          </button>
          <button
            type="button"
            onClick={() => changeType('COMPANY')}
            className={`rounded-2xl border p-4 text-left transition ${
              isCompany ? 'border-violet-300 bg-violet-50 text-violet-800 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
            }`}
          >
            <Building2 size={21} />
            <p className="mt-2 text-sm font-black">Empresa</p>
            <p className="mt-1 text-xs leading-5">RUC, razon social y datos de contacto empresarial.</p>
          </button>
        </section>

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
        {lookupFeedback}

        <FormGrid>
          {isCompany ? (
            <>
              <div className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">RUC</span>
                <div className="flex gap-2">
                  <Input required aria-label="RUC" maxLength={11} value={form.documentNumber} onChange={(event) => update('documentNumber', event.target.value.replace(/\D/g, ''))} containerClassName="min-w-0 flex-1" />
                  {lookupButton}
                </div>
              </div>
              <Select label="Estado" value={form.isActive ? 'active' : 'inactive'} onChange={(event) => update('isActive', event.target.value === 'active')}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Select>
              <Input required label="Razon social" value={form.businessName ?? ''} onChange={(event) => update('businessName', event.target.value)} containerClassName="sm:col-span-2" />
              <Input label="Nombre comercial" value={form.tradeName ?? ''} onChange={(event) => update('tradeName', event.target.value)} />
              <Input label="Representante legal" value={form.legalRepresentative ?? ''} onChange={(event) => update('legalRepresentative', event.target.value)} />
              <Input label="Telefono / WhatsApp" value={form.phone ?? ''} onChange={(event) => update('phone', event.target.value)} />
              <Input type="email" label="Correo empresarial" value={form.email ?? ''} onChange={(event) => update('email', event.target.value)} />
              <Input label="Direccion fiscal" value={form.address ?? ''} onChange={(event) => update('address', event.target.value)} />
              <Input label="Rubro" value={form.businessLine ?? ''} onChange={(event) => update('businessLine', event.target.value)} />
            </>
          ) : (
            <>
              <Select label="Tipo de documento" value={form.documentType} onChange={(event) => update('documentType', event.target.value as DocumentType)}>
                {naturalDocumentTypes.map((type) => <option key={type}>{type}</option>)}
              </Select>
              <div className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">Numero de documento</span>
                <div className="flex gap-2">
                  <Input required aria-label="Numero de documento" maxLength={form.documentType === 'DNI' ? 8 : undefined} value={form.documentNumber} onChange={(event) => update('documentNumber', form.documentType === 'DNI' ? event.target.value.replace(/\D/g, '') : event.target.value)} containerClassName="min-w-0 flex-1" />
                  {form.documentType === 'DNI' ? lookupButton : null}
                </div>
                {dniInlineMessage ? <p className="mt-1.5 text-xs font-semibold text-amber-600">{dniInlineMessage}</p> : null}
              </div>
              <Input required label="Nombres" value={form.firstName ?? ''} onChange={(event) => update('firstName', event.target.value)} />
              <Input label="Apellidos" value={form.lastName ?? ''} onChange={(event) => update('lastName', event.target.value)} />
              <Input label="Telefono / WhatsApp" value={form.phone ?? ''} onChange={(event) => update('phone', event.target.value)} />
              <Input type="email" label="Correo" value={form.email ?? ''} onChange={(event) => update('email', event.target.value)} />
              <Input label="Direccion" value={form.address ?? ''} onChange={(event) => update('address', event.target.value)} />
              <Select label="Estado" value={form.isActive ? 'active' : 'inactive'} onChange={(event) => update('isActive', event.target.value === 'active')}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Select>
            </>
          )}
          <Textarea label="Observaciones" value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} containerClassName="sm:col-span-2" />
        </FormGrid>
      </form>
    </Modal>
  );
}

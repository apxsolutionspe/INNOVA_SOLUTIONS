import { Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';

import { Button, Modal, StatusBadge } from '../../../components/ui';
import { Customer } from '../types/customer.types';
import { getCustomerDisplayName, getCustomerTypeLabel } from '../utils/customer-display';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value || '-'}</p>
    </div>
  );
}

export function CustomerDetailModal({ customer, onClose }: CustomerDetailModalProps) {
  const isCompany = customer.customerType === 'COMPANY';
  const Icon = isCompany ? Building2 : UserRound;

  return (
    <Modal
      title={getCustomerDisplayName(customer)}
      description="Ficha profesional del cliente registrado."
      size="lg"
      onClose={onClose}
      footer={<Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isCompany ? 'bg-violet-50 text-violet-700' : 'bg-cyan-50 text-cyan-700'}`}>
                <Icon size={23} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-950">{getCustomerDisplayName(customer)}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{getCustomerTypeLabel(customer.customerType)}</p>
              </div>
            </div>
            <StatusBadge status={customer.isActive} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
              <UserRound size={16} />
              {customer.documentType} {customer.documentNumber}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
              <Phone size={16} />
              {customer.phone || 'Sin telefono'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
              <Mail size={16} />
              {customer.email || 'Sin correo'}
            </span>
          </div>
        </section>

        {isCompany ? (
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Razon social" value={customer.businessName || customer.fullName} />
            <DetailItem label="Nombre comercial" value={customer.tradeName} />
            <DetailItem label="Representante legal" value={customer.legalRepresentative} />
            <DetailItem label="Rubro" value={customer.businessLine} />
            <DetailItem label="Direccion fiscal" value={customer.address} />
            <DetailItem label="Observaciones" value={customer.notes} />
          </section>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Nombres" value={customer.firstName || customer.fullName} />
            <DetailItem label="Apellidos" value={customer.lastName} />
            <DetailItem label="Direccion" value={customer.address} />
            <DetailItem label="Observaciones" value={customer.notes} />
          </section>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          <MapPin size={18} />
          Este cliente puede usarse en POS, ventas, servicios rapidos y ordenes tecnicas.
        </div>
      </div>
    </Modal>
  );
}

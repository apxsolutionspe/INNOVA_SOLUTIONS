import { useMemo, useState } from 'react';
import { Building2, Plus, UserCheck, Users, UserRound } from 'lucide-react';

import { ConfirmDialog, ErrorState, Toast } from '../../../components/ui';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { CustomerFilters } from '../components/CustomerFilters';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerTable } from '../components/CustomerTable';
import { useCustomers } from '../hooks/useCustomers';
import { Customer, CustomerPayload } from '../types/customer.types';

function KpiCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Users; tone: string }) {
  return (
    <article className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black leading-none text-slate-950">{value}</p>
        </div>
      </div>
    </article>
  );
}

export function CustomersPage() {
  const customers = useCustomers();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);

  const stats = useMemo(() => {
    const all = customers.customers;
    return {
      total: all.length,
      natural: all.filter((customer) => customer.customerType === 'NATURAL').length,
      companies: all.filter((customer) => customer.customerType === 'COMPANY').length,
      active: all.filter((customer) => customer.isActive).length,
    };
  }, [customers.customers]);

  const handleSubmit = async (payload: CustomerPayload) => {
    await customers.saveCustomer(payload, editingCustomer?.id);
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative p-5 sm:p-6">
          <div className="absolute inset-y-0 right-0 hidden w-96 bg-gradient-to-l from-cyan-50 via-violet-50 to-transparent lg:block" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Clientes</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Gestión de personas naturales y empresas para ventas, servicios y facturación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                setIsFormOpen(true);
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <Plus size={18} />
              Nuevo cliente
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total clientes" value={stats.total} icon={Users} tone="bg-blue-50 text-brand-blue" />
        <KpiCard label="Personas naturales" value={stats.natural} icon={UserRound} tone="bg-cyan-50 text-cyan-700" />
        <KpiCard label="Empresas" value={stats.companies} icon={Building2} tone="bg-violet-50 text-violet-700" />
        <KpiCard label="Clientes activos" value={stats.active} icon={UserCheck} tone="bg-emerald-50 text-emerald-700" />
      </div>

      <CustomerFilters
        search={customers.search}
        customerType={customers.customerType}
        statusFilter={customers.statusFilter}
        onSearchChange={customers.setSearch}
        onTypeChange={customers.setCustomerType}
        onStatusChange={customers.setStatusFilter}
      />
      <Toast message={customers.message} />
      {customers.error ? <ErrorState message={customers.error} /> : null}
      <CustomerTable
        customers={customers.customers}
        isLoading={customers.isLoading}
        onView={customers.setSelectedCustomer}
        onEdit={(customer) => {
          setEditingCustomer(customer);
          setIsFormOpen(true);
        }}
        onStatusChange={setCustomerToToggle}
      />
      {isFormOpen ? <CustomerForm customer={editingCustomer} onSubmit={handleSubmit} onClose={() => { setIsFormOpen(false); setEditingCustomer(null); }} /> : null}
      {customers.selectedCustomer ? <CustomerDetailModal customer={customers.selectedCustomer} onClose={() => customers.setSelectedCustomer(null)} /> : null}
      {customerToToggle ? (
        <ConfirmDialog
          title={customerToToggle.isActive ? 'Desactivar cliente' : 'Activar cliente'}
          message={`${customerToToggle.isActive ? 'Esta acción desactivará' : 'Esta acción activará'} a ${customerToToggle.fullName}.`}
          tone={customerToToggle.isActive ? 'danger' : 'info'}
          confirmLabel={customerToToggle.isActive ? 'Desactivar' : 'Activar'}
          onClose={() => setCustomerToToggle(null)}
          onConfirm={() => {
            void customers.setCustomerStatus(customerToToggle.id, !customerToToggle.isActive);
            setCustomerToToggle(null);
          }}
        />
      ) : null}
    </section>
  );
}


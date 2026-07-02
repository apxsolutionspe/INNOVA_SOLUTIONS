import { useState } from 'react';
import { motion } from 'framer-motion';

import { PageContainer } from '../../../components/layout/PageContainer';
import { SupplierDetailModal } from '../components/SupplierDetailModal';
import { SupplierFilters } from '../components/SupplierFilters';
import { SupplierForm } from '../components/SupplierForm';
import { SupplierTable } from '../components/SupplierTable';
import { useSuppliers } from '../hooks/useSuppliers';
import { Supplier, SupplierPayload } from '../types/supplier.types';

export function SuppliersPage() {
  const suppliers = useSuppliers();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (payload: SupplierPayload) => {
    await suppliers.saveSupplier(payload, editingSupplier?.id);
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const activeCount = suppliers.suppliers.filter((supplier) => supplier.isActive).length;
  const inactiveCount = suppliers.suppliers.length - activeCount;
  const lastSupplier = suppliers.suppliers[0]?.name ?? 'Sin registros';

  return (
    <PageContainer title="Proveedores" description="Gestion de proveedores para compras y abastecimiento.">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total proveedores', suppliers.suppliers.length],
          ['Activos', activeCount],
          ['Inactivos', inactiveCount],
          ['Ultimo registrado', lastSupplier],
        ].map(([label, value]) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </motion.div>
        ))}
      </div>
      <SupplierFilters search={suppliers.search} onSearchChange={suppliers.setSearch} onCreate={() => setIsFormOpen(true)} />
      {suppliers.message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{suppliers.message}</div> : null}
      {suppliers.error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{suppliers.error}</div> : null}
      <SupplierTable suppliers={suppliers.suppliers} isLoading={suppliers.isLoading} onView={suppliers.setSelectedSupplier} onEdit={(supplier) => { setEditingSupplier(supplier); setIsFormOpen(true); }} onDeactivate={(supplier) => void suppliers.deactivateSupplier(supplier.id)} />
      {isFormOpen ? <SupplierForm supplier={editingSupplier} onSubmit={handleSubmit} onClose={() => { setIsFormOpen(false); setEditingSupplier(null); }} /> : null}
      {suppliers.selectedSupplier ? <SupplierDetailModal supplier={suppliers.selectedSupplier} onClose={() => suppliers.setSelectedSupplier(null)} /> : null}
    </PageContainer>
  );
}

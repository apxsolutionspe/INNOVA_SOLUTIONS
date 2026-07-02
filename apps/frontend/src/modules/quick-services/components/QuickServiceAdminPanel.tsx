import { FormEvent, useState } from 'react';
import { Edit3, Plus, Power, Settings } from 'lucide-react';

import { TableShell } from '../../../components/ui';
import { quickServicesService } from '../services/quick-services.service';
import { QuickService, QuickServiceCategory } from '../types/quick-service.types';

interface ServiceDraft {
  name: string;
  categoryId: string;
  unit: string;
  unitPrice: number;
  costPrice?: number;
  description?: string;
}

interface QuickServiceAdminPanelProps {
  categories: QuickServiceCategory[];
  services: QuickService[];
  onReload: () => Promise<void>;
}

const emptyService: ServiceDraft = {
  name: '',
  categoryId: '',
  unit: 'unidad',
  unitPrice: 0,
  costPrice: 0,
  description: '',
};

export function QuickServiceAdminPanel({ categories, services, onReload }: QuickServiceAdminPanelProps) {
  const [categoryName, setCategoryName] = useState('');
  const [service, setService] = useState<ServiceDraft>(emptyService);
  const [editingCategory, setEditingCategory] = useState<QuickServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<QuickService | null>(null);
  const [message, setMessage] = useState('');

  const createCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await quickServicesService.createCategory({ name: categoryName.trim() });
    setCategoryName('');
    setMessage('Categoria creada correctamente.');
    await onReload();
  };

  const createService = async (event: FormEvent) => {
    event.preventDefault();
    if (!service.name.trim() || !service.categoryId || service.unitPrice <= 0) return;
    await quickServicesService.createService({
      ...service,
      name: service.name.trim(),
      costPrice: service.costPrice || undefined,
      description: service.description?.trim() || undefined,
    });
    setService(emptyService);
    setMessage('Servicio creado correctamente.');
    await onReload();
  };

  const editCategory = async (category: QuickServiceCategory) => {
    if (!category.name.trim()) return;
    await quickServicesService.updateCategory(category.id, { name: category.name.trim() });
    setEditingCategory(null);
    setMessage('Categoria actualizada.');
    await onReload();
  };

  const editService = async (item: QuickService) => {
    if (!item.name.trim()) return;
    await quickServicesService.updateService(item.id, {
      name: item.name.trim(),
      categoryId: item.categoryId,
      unit: item.unit,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice ?? 0,
      description: item.description ?? '',
    });
    setEditingService(null);
    setMessage('Servicio actualizado.');
    await onReload();
  };

  const deactivateService = async (item: QuickService) => {
    if (!window.confirm(`Desactivar ${item.name}?`)) return;
    await quickServicesService.deleteService(item.id);
    setMessage('Servicio desactivado.');
    await onReload();
  };

  const deactivateCategory = async (category: QuickServiceCategory) => {
    if (!window.confirm(`Desactivar ${category.name}?`)) return;
    await quickServicesService.deleteCategory(category.id);
    setMessage('Categoria desactivada.');
    await onReload();
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[23rem_minmax(0,1fr)]">
      <div className="space-y-4">
        <form onSubmit={createCategory} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-sm font-black text-slate-950">
            <Settings size={17} />
            Nueva categoria
          </h2>
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Ej. Servicios PDF"
            className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
          <button className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-blue text-sm font-black text-white">
            <Plus size={17} />
            Crear categoria
          </button>
        </form>

        <form onSubmit={createService} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-950">Nuevo servicio</h2>
          <div className="mt-3 grid gap-3">
            <input value={service.name} onChange={(event) => setService({ ...service, name: event.target.value })} placeholder="Nombre del servicio" className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
            <select value={service.categoryId} onChange={(event) => setService({ ...service, categoryId: event.target.value })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
              <option value="">Categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={service.unit} onChange={(event) => setService({ ...service, unit: event.target.value })} placeholder="Unidad" className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
              <input type="number" min="0" step="0.01" value={service.unitPrice} onChange={(event) => setService({ ...service, unitPrice: Number(event.target.value) })} placeholder="Precio" className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
            </div>
            <input type="number" min="0" step="0.01" value={service.costPrice ?? 0} onChange={(event) => setService({ ...service, costPrice: Number(event.target.value) })} placeholder="Costo estimado" className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
          </div>
          <button className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-violet text-sm font-black text-white">
            <Plus size={17} />
            Crear servicio
          </button>
          {message ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{message}</p> : null}
        </form>
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-950">Categorias</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-sm font-bold text-slate-800">{category.name}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditingCategory(category)} className="grid h-8 w-8 place-items-center rounded-lg text-brand-blue hover:bg-white" title="Editar"><Edit3 size={15} /></button>
                  <button type="button" onClick={() => void deactivateCategory(category)} className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-white" title="Desactivar"><Power size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-black text-slate-950">Servicios configurados</h2>
          </div>
          <TableShell maxHeight="clamp(320px,48vh,560px)" className="rounded-none border-0 shadow-none">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase text-slate-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Costo</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((item) => (
                  <tr key={item.id} className="transition hover:bg-blue-50/35">
                    <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.category.name}</td>
                    <td className="px-4 py-3 font-bold">S/ {item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">S/ {(item.costPrice ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setEditingService(item)} className="mr-2 rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-black text-brand-blue">Editar</button>
                      <button type="button" onClick={() => void deactivateService(item)} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-black text-red-600">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </section>
      </div>

      {editingCategory ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void editCategory(editingCategory);
            }}
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
          >
            <h3 className="text-lg font-black text-slate-950">Editar categoria</h3>
            <input
              value={editingCategory.name}
              onChange={(event) => setEditingCategory({ ...editingCategory, name: event.target.value })}
              className="mt-4 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingCategory(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600">Cerrar</button>
              <button className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Guardar</button>
            </div>
          </form>
        </div>
      ) : null}

      {editingService ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void editService(editingService);
            }}
            className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl"
          >
            <h3 className="text-lg font-black text-slate-950">Editar servicio</h3>
            <div className="mt-4 grid gap-3">
              <input value={editingService.name} onChange={(event) => setEditingService({ ...editingService, name: event.target.value })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
              <select value={editingService.categoryId} onChange={(event) => setEditingService({ ...editingService, categoryId: event.target.value, category: categories.find((category) => category.id === event.target.value) ?? editingService.category })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={editingService.unit} onChange={(event) => setEditingService({ ...editingService, unit: event.target.value })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
                <input type="number" min="0" step="0.01" value={editingService.unitPrice} onChange={(event) => setEditingService({ ...editingService, unitPrice: Number(event.target.value) })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
                <input type="number" min="0" step="0.01" value={editingService.costPrice ?? 0} onChange={(event) => setEditingService({ ...editingService, costPrice: Number(event.target.value) })} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingService(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600">Cerrar</button>
              <button className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Guardar</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

import { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { TableShell } from './TableShell';
import { cn } from './utils';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  items: T[];
  columns: Array<DataTableColumn<T>>;
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  maxHeight?: string;
}

export function DataTable<T>({
  items,
  columns,
  getRowKey,
  isLoading = false,
  emptyTitle = 'No hay registros',
  emptyDescription = 'No hay resultados para mostrar con los filtros actuales.',
  onRowClick,
  maxHeight,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingState rows={5} />;
  if (!items.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight={maxHeight} className="hidden rounded-none border-0 shadow-none md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn('px-4 py-3.5', column.className)}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                onClick={() => onRowClick?.(item)}
                className={cn('transition hover:bg-blue-50/35', onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3.5 align-middle', column.className)}>{column.cell(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <div className="table-scroll-shell max-h-[70vh] divide-y divide-slate-100 overflow-y-auto md:hidden">
        {items.map((item) => (
          <div key={getRowKey(item)} onClick={() => onRowClick?.(item)} className={cn('space-y-3 p-4', onRowClick && 'cursor-pointer')}>
            {columns.map((column) => (
              <div key={column.key} className={column.hideOnMobile ? 'hidden' : 'flex items-start justify-between gap-4'}>
                <span className="text-xs font-black uppercase text-slate-400">{column.header}</span>
                <div className="text-right text-sm text-slate-700">{column.cell(item)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

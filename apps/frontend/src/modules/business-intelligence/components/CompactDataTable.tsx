import { ReactNode } from 'react';

interface CompactDataTableProps<T> {
  columns: string[];
  rows: T[];
  emptyText: string;
  renderRow: (row: T) => ReactNode;
}

export function CompactDataTable<T>({ columns, rows, emptyText, renderRow }: CompactDataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="hidden bg-slate-50/95 px-4 py-3 text-xs font-black uppercase text-slate-400 md:grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => <span key={column}>{column}</span>)}
      </div>
      {rows.length ? <div className="table-scroll-shell max-h-[22rem] divide-y divide-slate-100 overflow-y-auto">{rows.map(renderRow)}</div> : <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">{emptyText}</div>}
    </div>
  );
}

import { ReactNode } from 'react';

interface ReportDataTableProps {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  emptyMessage?: string;
}

export function ReportDataTable({
  columns,
  rows,
  emptyMessage = 'No hay datos para el periodo seleccionado.',
}: ReportDataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="max-h-[24rem] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition hover:bg-slate-50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${rowIndex}-${cellIndex}`}
                      className={`px-4 py-3 align-middle text-slate-700 ${
                        cellIndex === row.length - 1 ? 'text-right font-black text-slate-950' : ''
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  <div className="space-y-1">
                    <p>{emptyMessage}</p>
                    <p className="text-xs font-medium text-slate-400">Ajusta los filtros o registra operaciones para generar este reporte.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

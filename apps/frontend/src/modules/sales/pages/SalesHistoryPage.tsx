import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { ReceiptPreviewModal } from '../../pos/components/ReceiptPreviewModal';
import { CancelSaleModal } from '../components/CancelSaleModal';
import { SaleDetailModal } from '../components/SaleDetailModal';
import { SalesHistoryFilters } from '../components/SalesHistoryFilters';
import { SalesHistoryHeader } from '../components/SalesHistoryHeader';
import { SalesHistoryState } from '../components/SalesHistoryState';
import { SalesTable } from '../components/SalesTable';
import { salesService } from '../services/sales.service';
import { Sale } from '../types/sale.types';

export function SalesHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [receipt, setReceipt] = useState<{ sale: Sale; html: string } | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await salesService.findAll({ search, status, page: 1, limit: 50 });
      setSales(response.items);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'No se pudo cargar ventas.';
      if (message.includes('401')) {
        setError('Tu sesión expiró. Inicia sesión nuevamente para consultar el historial.');
      } else if (message.includes('403')) {
        setError('No tienes permisos para consultar el historial de ventas.');
      } else {
        setError(message || 'No se pudo cargar el historial. Verifica la conexión con el servidor.');
      }
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const totalAmount = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
  const hasFilters = Boolean(search.trim() || status);

  const cancelSale = async (reason: string) => {
    if (!saleToCancel) return;
    await salesService.cancel(saleToCancel.id, reason);
    setSaleToCancel(null);
    await loadSales();
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <SalesHistoryHeader
        totalSales={sales.length}
        totalAmount={totalAmount}
        isLoading={isLoading}
        onRefresh={() => void loadSales()}
      />

      <SalesHistoryFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onClear={() => {
          setSearch('');
          setStatus('');
        }}
      />

      {error ? (
        <SalesHistoryState type="error" message={error} onRetry={() => void loadSales()} />
      ) : isLoading ? (
        <SalesHistoryState type="loading" />
      ) : sales.length ? (
        <SalesTable
          sales={sales}
          isLoading={false}
          onDetail={setSelectedSale}
          onCancel={setSaleToCancel}
          onReceipt={(sale) => void salesService.receipt(sale.id).then(setReceipt)}
          canCancel={user?.role.name === 'ADMIN'}
        />
      ) : (
        <SalesHistoryState type={hasFilters ? 'filtered-empty' : 'empty'} />
      )}

      {selectedSale ? <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} /> : null}
      {saleToCancel ? <CancelSaleModal sale={saleToCancel} onSubmit={cancelSale} onClose={() => setSaleToCancel(null)} /> : null}
      {receipt ? <ReceiptPreviewModal receipt={receipt} onClose={() => setReceipt(null)} /> : null}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

import { useAuthStore } from '../../../store/auth.store';
import { CancelQuickServiceSaleModal } from '../components/CancelQuickServiceSaleModal';
import { QuickServiceReceiptModal } from '../components/QuickServiceReceiptModal';
import { QuickServiceSalesHistory } from '../components/QuickServiceSalesHistory';
import { quickServicesService } from '../services/quick-services.service';
import { QuickServiceSale } from '../types/quick-service.types';

export function QuickServiceSalesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const [sales, setSales] = useState<QuickServiceSale[]>([]);
  const [receipt, setReceipt] = useState('');
  const [toCancel, setToCancel] = useState<QuickServiceSale | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setSales(await quickServicesService.sales());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/quick-services" className="inline-flex items-center gap-2 text-xs font-black uppercase text-brand-blue">
              <ArrowLeft size={15} />
              Servicios rapidos
            </Link>
            <h1 className="mt-3 text-2xl font-black text-slate-950">Historial de servicios</h1>
            <p className="mt-2 text-sm text-slate-600">Operaciones de servicios rápidos registradas.</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-brand-cyan hover:text-brand-blue disabled:opacity-60"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={17} />
            Actualizar
          </button>
        </div>
      </header>

      <QuickServiceSalesHistory
        sales={sales}
        isAdmin={isAdmin}
        onReceipt={(sale) => void quickServicesService.receipt(sale.id).then((response) => setReceipt(response.html))}
        onCancel={(sale) => setToCancel(sale)}
      />

      {receipt ? <QuickServiceReceiptModal html={receipt} onClose={() => setReceipt('')} /> : null}
      {toCancel ? (
        <CancelQuickServiceSaleModal
          onClose={() => setToCancel(null)}
          onSubmit={async (reason) => {
            await quickServicesService.cancel(toCancel.id, reason);
            setToCancel(null);
            await load();
          }}
        />
      ) : null}
    </section>
  );
}


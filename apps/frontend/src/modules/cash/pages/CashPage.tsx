import { useState } from 'react';
import { History, LockKeyhole, UnlockKeyhole } from 'lucide-react';

import { CashFilters } from '../components/CashFilters';
import { CashHeader } from '../components/CashHeader';
import { CashMovementForm } from '../components/CashMovementForm';
import { CashMovementsTable } from '../components/CashMovementsTable';
import { CashSessionDetailModal } from '../components/CashSessionDetailModal';
import { CashSummaryCards } from '../components/CashSummaryCards';
import { CloseCashModal } from '../components/CloseCashModal';
import { OpenCashModal } from '../components/OpenCashModal';
import { useCash } from '../hooks/useCash';
import { CashSession } from '../types/cash.types';
import { formatMoney } from '../utils/cash-calculations';

export function CashPage() {
  const cash = useCash();
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [detailSession, setDetailSession] = useState<CashSession | null>(null);
  const isOpen = cash.currentSession?.status === 'OPEN';

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <CashHeader
        session={cash.currentSession}
        isLoading={cash.isLoading}
        onRefresh={() => void cash.reload()}
        onOpen={() => setOpenModal(true)}
        onClose={() => setCloseModal(true)}
      />

      {cash.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {cash.error}
        </div>
      ) : null}

      <CashSummaryCards session={cash.currentSession} summary={cash.summary} />

      {isOpen ? (
        <CashMovementForm onDone={() => void cash.reload()} />
      ) : (
        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-800 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">
                <LockKeyhole size={20} />
              </div>
              <div>
                <h2 className="text-base font-black">Caja cerrada</h2>
                <p className="mt-1 text-sm font-semibold leading-6">
                  Debe abrir caja para registrar movimientos, ventas o servicios rápidos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-warning px-4 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
            >
              <UnlockKeyhole size={18} />
              Abrir caja
            </button>
          </div>
        </section>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="min-w-0 space-y-4">
          <CashFilters
            type={cash.type}
            paymentMethod={cash.paymentMethod}
            search={cash.search}
            onTypeChange={cash.setType}
            onPaymentMethodChange={cash.setPaymentMethod}
            onSearchChange={cash.setSearch}
          />
          <CashMovementsTable movements={cash.movements} />
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <History size={18} className="text-brand-blue" />
              <h2 className="font-black text-slate-950">Historial de cajas</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Consulta cierres anteriores y sus movimientos.</p>
            <div className="table-scroll-shell mt-4 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {cash.sessions.length ? (
                cash.sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setDetailSession(session)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand-cyan hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-900">{session.code}</span>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-black ${session.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Neto: {formatMoney(session.totalSales - session.totalExpenses)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Aún no hay sesiones registradas.
                </div>
              )}
            </div>
          </section>

          {isOpen && cash.currentSession ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <h2 className="font-black text-emerald-900">Arqueo preliminar</h2>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Efectivo esperado" value={formatMoney(cash.currentSession.expectedCashAmount)} />
                <Row label="Gastos" value={formatMoney(cash.summary.expensesToday)} />
                <Row label="Neto esperado" value={formatMoney(cash.summary.netCashToday)} />
              </div>
              <button
                type="button"
                onClick={() => setCloseModal(true)}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black text-white transition hover:bg-red-700"
              >
                <LockKeyhole size={18} />
                Cerrar caja
              </button>
            </section>
          ) : null}
        </aside>
      </div>

      {openModal ? <OpenCashModal onClose={() => setOpenModal(false)} onDone={() => void cash.reload()} /> : null}
      {closeModal && cash.currentSession ? (
        <CloseCashModal session={cash.currentSession} summary={cash.summary} onClose={() => setCloseModal(false)} onDone={() => void cash.reload()} />
      ) : null}
      {detailSession ? <CashSessionDetailModal session={detailSession} onClose={() => setDetailSession(null)} /> : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
      <span className="font-semibold text-emerald-800">{label}</span>
      <strong className="text-emerald-950">{value}</strong>
    </div>
  );
}

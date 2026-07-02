import { useEffect, useMemo, useState } from 'react';

import { cashService } from '../services/cash.service';
import { CashMovement, CashSession, CashSummary } from '../types/cash.types';

const emptySummary: CashSummary = {
  currentCashStatus: 'CLOSED',
  totalCashToday: 0,
  totalYapeToday: 0,
  totalPlinToday: 0,
  totalTransferToday: 0,
  expensesToday: 0,
  netCashToday: 0,
};

export function useCash() {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [summary, setSummary] = useState<CashSummary>(emptySummary);
  const [type, setType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const reload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [current, sessionList, movementList, summaryData] = await Promise.all([
        cashService.current(),
        cashService.sessions(),
        cashService.movements({ type: type || undefined, paymentMethod: paymentMethod || undefined }),
        cashService.summary(),
      ]);
      setCurrentSession(current);
      setSessions(sessionList);
      setMovements(movementList);
      setSummary(summaryData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar caja.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [type, paymentMethod]);

  const filteredMovements = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movements;
    return movements.filter((movement) =>
      [movement.concept, movement.reference, movement.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [movements, search]);

  return {
    currentSession,
    sessions,
    movements: filteredMovements,
    summary,
    type,
    paymentMethod,
    search,
    isLoading,
    error,
    setType,
    setPaymentMethod,
    setSearch,
    reload,
  };
}

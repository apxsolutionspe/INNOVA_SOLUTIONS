import { useCallback, useEffect, useState } from 'react';
import { auditService } from '../services/audit.service';
import { AuditLog } from '../types/audit.types';

export function useAuditLogs() {
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [items, setItems] = useState<AuditLog[]>([]);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setItems(await auditService.findAll(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar auditoría.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  useEffect(() => { void load(); }, [load]);
  return { filters, setFilters, items, selected, setSelected, error, isLoading, load };
}

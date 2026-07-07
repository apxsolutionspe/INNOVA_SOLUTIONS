const toSafeNumber = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatCurrency = (value: unknown) =>
  `S/ ${toSafeNumber(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatNumber = (value: unknown) => toSafeNumber(value).toLocaleString('es-PE');

export const formatPercent = (value: unknown) =>
  `${toSafeNumber(value).toLocaleString('es-PE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

export const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const shortDate = (value: string) => formatDate(value).slice(0, 5);

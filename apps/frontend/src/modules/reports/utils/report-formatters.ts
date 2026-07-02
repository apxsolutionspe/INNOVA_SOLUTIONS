export const formatCurrency = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;

export const formatPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

export const shortDate = (value: string) => new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });

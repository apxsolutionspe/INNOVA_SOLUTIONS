export function resolveReportDateRange(startDate?: string, endDate?: string) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate ? new Date(endDate) : now;
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function formatDateRange(start: Date, end: Date) {
  return `${start.toLocaleDateString('es-PE')} - ${end.toLocaleDateString('es-PE')}`;
}

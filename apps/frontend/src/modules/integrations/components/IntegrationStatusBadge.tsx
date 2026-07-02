export function IntegrationStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const style =
    normalized === 'CONNECTED' || normalized === 'CONFIGURED'
      ? 'bg-emerald-50 text-emerald-700'
      : normalized === 'MOCK'
        ? 'bg-cyan-50 text-cyan-700'
        : normalized === 'ERROR'
          ? 'bg-red-50 text-red-700'
          : 'bg-orange-50 text-orange-700';
  const label: Record<string, string> = { CONNECTED: 'Conectado', CONFIGURED: 'Configurado', MOCK: 'Mock', ERROR: 'Error', NOT_CONFIGURED: 'No configurado' };
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${style}`}>{label[normalized] ?? status}</span>;
}

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="sticky top-16 z-30 flex items-center justify-center gap-2 bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white">
      <WifiOff size={17} />
      Estas sin conexion. Algunas funciones estan limitadas.
    </div>
  );
}

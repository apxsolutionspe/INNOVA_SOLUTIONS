import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="sticky top-16 z-40 flex items-center justify-center gap-2 bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white sm:top-20">
      <WifiOff size={17} />
      Estás sin conexión. Algunas funciones están limitadas.
    </div>
  );
}


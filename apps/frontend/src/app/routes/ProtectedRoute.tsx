import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useAuthStore } from '../../store/auth.store';

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(token && !user));

  useEffect(() => {
    let isMounted = true;

    if (!token || user) {
      setIsCheckingSession(false);
      return;
    }

    setIsCheckingSession(true);
    loadProfile()
      .catch(() => {
        // El store limpia la sesión si el token ya no es válido.
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadProfile, token, user]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isCheckingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-surface px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-black text-slate-900">Validando sesión</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Preparando tu panel de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

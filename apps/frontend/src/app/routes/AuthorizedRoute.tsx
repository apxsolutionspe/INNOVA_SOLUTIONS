import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';
import { canAccessModule } from '../../lib/rbac';
import { useAuthStore } from '../../store/auth.store';

interface AuthorizedRouteProps {
  moduleKey: string;
}

export function AuthorizedRoute({ moduleKey }: AuthorizedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessModule(user, moduleKey)) {
    return <UnauthorizedState />;
  }

  return <Outlet />;
}

function UnauthorizedState() {
  return (
    <section className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-4 py-10 text-center">
      <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm shadow-red-100/70">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert size={27} />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-950">Acceso no autorizado</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Tu rol actual no tiene permisos para ver este módulo. Si necesitas acceso, solicita autorización a un administrador.
        </p>
        <div className="mt-6">
          <Button type="button" onClick={() => window.history.back()} variant="secondary" className="rounded-full">
            Volver
          </Button>
        </div>
      </div>
    </section>
  );
}

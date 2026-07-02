import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, SearchX, UserPlus, UsersRound } from 'lucide-react';
import { Button, EmptyState, ErrorState, LoadingState } from '../../../components/ui';
import { Role } from '../../../types/auth';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { UserFilters } from '../components/UserFilters';
import { UserForm } from '../components/UserForm';
import { UserStats } from '../components/UserStats';
import { UserTable } from '../components/UserTable';
import { usersService } from '../services/users.service';
import { SystemUser, UserPayload } from '../types/user.types';

export function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<SystemUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('all');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedUsers, loadedRoles] = await Promise.all([usersService.findAll(), usersService.roles()]);
      setUsers(loadedUsers);
      setRoles(loadedRoles);
    } catch {
      setError('No se pudo cargar la lista de usuarios. Verifica la conexión con la API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !normalizedSearch
        || user.fullName.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleId === 'all' || user.roleId === roleId;
      const matchesStatus = status === 'all' || (status === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleId, search, status, users]);

  const hasFilters = Boolean(search.trim()) || roleId !== 'all' || status !== 'all';

  const save = async (payload: UserPayload) => {
    if (editing) {
      await usersService.update(editing.id, payload);
    } else {
      await usersService.create(payload);
    }
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const toggleStatus = async (user: SystemUser) => {
    await usersService.status(user.id, !user.isActive);
    await load();
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-5 shadow-sm shadow-blue-100/70 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200 sm:grid">
              <UsersRound size={25} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Panel administrativo</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Usuarios</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Administra accesos, roles y estado de cuentas con una vista clara y controlada.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => void load()} disabled={isLoading} className="rounded-full">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </Button>
            <Button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500">
              <UserPlus size={17} />
              Nuevo usuario
            </Button>
          </div>
        </div>
      </div>

      <UserStats users={users} />

      <UserFilters
        search={search}
        roleId={roleId}
        status={status}
        roles={roles}
        onSearchChange={setSearch}
        onRoleChange={setRoleId}
        onStatusChange={setStatus}
      />

      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {isLoading ? (
        <LoadingState rows={6} />
      ) : filteredUsers.length ? (
        <UserTable
          users={filteredUsers}
          onEdit={(user) => { setEditing(user); setFormOpen(true); }}
          onStatus={(user) => void toggleStatus(user)}
          onPassword={setPasswordUser}
        />
      ) : (
        <EmptyState
          icon={hasFilters ? SearchX : UsersRound}
          title={hasFilters ? 'Sin resultados con estos filtros' : 'No hay usuarios registrados'}
          description={hasFilters ? 'Ajusta la búsqueda, el rol o el estado para encontrar usuarios.' : 'Crea usuarios para asignar roles y accesos al sistema.'}
          action={!hasFilters ? (
            <Button type="button" onClick={() => setFormOpen(true)} className="rounded-full">
              <UserPlus size={16} />
              Nuevo usuario
            </Button>
          ) : null}
        />
      )}

      {formOpen ? (
        <UserForm
          user={editing}
          roles={roles}
          onSubmit={save}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      ) : null}

      {passwordUser ? (
        <ChangePasswordModal
          onClose={() => setPasswordUser(null)}
          onSubmit={async (password) => {
            await usersService.changePassword(passwordUser.id, password);
            setPasswordUser(null);
          }}
        />
      ) : null}
    </section>
  );
}

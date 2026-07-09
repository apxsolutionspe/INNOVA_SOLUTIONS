import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../../store/auth.store';
import { LoginBackgroundEffects } from '../components/LoginBackgroundEffects';
import { LoginCard } from '../components/LoginCard';

const genericLoginError = 'No se pudo iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.';
const serverUnavailableError = 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';

function getLoginErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return genericLoginError;
  if (error.message === 'AUTH_SERVER_UNAVAILABLE') return serverUnavailableError;
  if (error.message === 'AUTH_INVALID_CREDENTIALS') return genericLoginError;
  if (error.message === 'AUTH_INVALID_RESPONSE') return 'La respuesta del servidor no fue válida. Inténtalo nuevamente.';
  return genericLoginError;
}

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Ingresa tu correo.';
    if (!password.trim()) errors.password = 'Ingresa tu contraseña.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (loginError) {
      if (import.meta.env.DEV) {
        console.warn('[Login] Diagnóstico controlado:', loginError instanceof Error ? loginError.message : 'AUTH_UNKNOWN_ERROR');
      }
      setError(getLoginErrorMessage(loginError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <LoginBackgroundEffects />
      <section className="login-shell">
        <LoginCard
          email={email}
          password={password}
          fieldErrors={fieldErrors}
          error={error}
          isLoading={isLoading}
          onEmailChange={(value) => {
            setEmail(value);
            setError('');
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          onPasswordChange={(value) => {
            setPassword(value);
            setError('');
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}

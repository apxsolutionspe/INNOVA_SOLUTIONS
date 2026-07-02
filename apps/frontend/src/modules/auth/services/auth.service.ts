import { httpClient } from '../../../services/http-client';
import { AuthUser, LoginCredentials, LoginResponse } from '../../../types/auth';

const TOKEN_KEY = 'innova_access_token';

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const { data } = await httpClient.post<LoginResponse>('/auth/login', credentials);

      if (!data?.accessToken || !data?.user) {
        throw new Error('AUTH_INVALID_RESPONSE');
      }

      localStorage.setItem(TOKEN_KEY, data.accessToken);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message.includes('Credenciales invalidas')) {
        throw new Error('AUTH_INVALID_CREDENTIALS');
      }

      if (
        message.includes('Network Error')
        || message.includes('timeout')
        || message.includes('No se pudo completar')
        || message.includes('ERR_NETWORK')
      ) {
        throw new Error('AUTH_SERVER_UNAVAILABLE');
      }

      if (message === 'AUTH_INVALID_RESPONSE') {
        throw error;
      }

      throw new Error('AUTH_UNEXPECTED_ERROR');
    }
  },

  async getProfile() {
    const { data } = await httpClient.get<AuthUser>('/auth/profile');
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

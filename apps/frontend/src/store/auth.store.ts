import { create } from 'zustand';

import { authService } from '../modules/auth/services/auth.service';
import { AuthUser, LoginCredentials } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: authService.getStoredToken(),
  isAuthenticated: Boolean(authService.getStoredToken()),

  async login(credentials) {
    const response = await authService.login(credentials);
    set({
      user: response.user,
      token: response.accessToken,
      isAuthenticated: true,
    });
  },

  logout() {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  async loadProfile() {
    try {
      const user = await authService.getProfile();
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },
}));

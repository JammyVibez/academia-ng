import { create } from 'zustand';
import { ApiError, api } from './api';
import { clearTokens, currentTokens, loadTokens, saveTokens } from './session';
import { readJSON, writeJSON } from './storage';
import type { AuthResult, Profile, RegisterInput } from './types';

const USER_KEY = 'academia.user';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (fullName: string) => Promise<Profile>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: async () => {
    if (get().isHydrated) return;

    const tokens = await loadTokens();
    const storedUser = await readJSON<Profile>(USER_KEY);
    set({ isAuthenticated: Boolean(tokens), user: tokens ? storedUser : null, isHydrated: true });

    if (!tokens) return;

    // Refresh the cached profile; only a rejected token signs the student out.
    try {
      const profile = await api<Profile>('/auth/me');
      await writeJSON(USER_KEY, profile);
      set({ user: profile, isAuthenticated: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) await get().logout();
    }
  },

  login: async (email, password) => {
    const result = await api<AuthResult>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    await writeJSON(USER_KEY, result.user);
    set({ user: result.user, isAuthenticated: true });
  },

  register: async (input) => {
    const result = await api<AuthResult>('/auth/register', {
      method: 'POST',
      auth: false,
      body: input,
    });
    await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    await writeJSON(USER_KEY, result.user);
    set({ user: result.user, isAuthenticated: true });
  },

  logout: async () => {
    const tokens = currentTokens();
    set({ user: null, isAuthenticated: false });
    await clearTokens();
    await writeJSON(USER_KEY, null);

    if (tokens?.refreshToken) {
      api('/auth/logout', {
        method: 'POST',
        auth: false,
        body: { refreshToken: tokens.refreshToken },
      }).catch(() => undefined);
    }
  },

  updateName: async (fullName) => {
    const profile = await api<Profile>('/auth/me', { method: 'PATCH', body: { fullName } });
    await writeJSON(USER_KEY, profile);
    set({ user: profile });
    return profile;
  },
}));

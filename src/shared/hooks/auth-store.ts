import { create } from 'zustand';

import { fetchCurrentUser } from '@/entities/user/api/user-api';
import type { AuthTokens, CaptainUser } from '@/entities/user/model/types';
import { registerAuthSessionExpiredHandler } from '@/shared/api/client';
import { secureStorage, storageKeys } from '@/shared/lib/storage';

type AuthState = {
  status: 'checking' | 'authenticated' | 'unauthenticated';
  user: CaptainUser | null;
  requiresProfileCompletion: boolean;
  onboardingComplete: boolean;

  hydrate: () => Promise<void>;
  signIn: (tokens: AuthTokens) => Promise<void>;
  setUser: (user: CaptainUser) => void;
  setOnboardingComplete: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  user: null,
  requiresProfileCompletion: false,
  onboardingComplete: false,

  hydrate: async () => {
    const [accessToken, refreshToken, onboardingComplete, requiresProfileCompletion] =
      await Promise.all([
        secureStorage.get(storageKeys.accessToken),
        secureStorage.get(storageKeys.refreshToken),
        secureStorage.get(storageKeys.onboardingComplete),
        secureStorage.get(storageKeys.requiresProfileCompletion),
      ]);

    if (!accessToken && !refreshToken) {
      set({
        status: 'unauthenticated',
        user: null,
        onboardingComplete: false,
      });
      return;
    }

    try {
      const user = await fetchCurrentUser();

      set({
        status: 'authenticated',
        user,
        requiresProfileCompletion: user.fullName === null || requiresProfileCompletion === 'true',
        onboardingComplete: onboardingComplete === 'true',
      });
    } catch {
      await Promise.all([
        secureStorage.remove(storageKeys.accessToken),
        secureStorage.remove(storageKeys.refreshToken),
        secureStorage.remove(storageKeys.requiresProfileCompletion),
      ]);

      set({
        status: 'unauthenticated',
        user: null,
      });
    }
  },

  signIn: async (tokens) => {
    await Promise.all([
      tokens.accessToken
        ? secureStorage.set(storageKeys.accessToken, tokens.accessToken)
        : Promise.resolve(),
      tokens.refreshToken
        ? secureStorage.set(storageKeys.refreshToken, tokens.refreshToken)
        : Promise.resolve(),
      secureStorage.set(
        storageKeys.requiresProfileCompletion,
        String(tokens.requiresProfileCompletion)
      ),
    ]);

    set({
      status: 'authenticated',
      user: tokens.user,
      requiresProfileCompletion: tokens.requiresProfileCompletion,
    });
  },

  setUser: (user) => {
    void secureStorage.set(storageKeys.requiresProfileCompletion, 'false');
    set({ user, requiresProfileCompletion: false });
  },

  setOnboardingComplete: async () => {
    await secureStorage.set(storageKeys.onboardingComplete, 'true');
    set({ onboardingComplete: true });
  },

  signOut: async () => {
    await Promise.all([
      secureStorage.remove(storageKeys.accessToken),
      secureStorage.remove(storageKeys.refreshToken),
      secureStorage.remove(storageKeys.requiresProfileCompletion),
      secureStorage.remove(storageKeys.onboardingComplete),
    ]);

    set({
      status: 'unauthenticated',
      user: null,
      requiresProfileCompletion: false,
      onboardingComplete: false,
    });
  },
}));

registerAuthSessionExpiredHandler(() => {
  void useAuthStore.getState().signOut();
});

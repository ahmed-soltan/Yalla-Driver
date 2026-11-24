import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export const storageKeys = {
  accessToken: 'yalla.auth.accessToken',
  refreshToken: 'yalla.auth.refreshToken',
  requiresProfileCompletion: 'yalla.auth.requiresProfileCompletion',
  deviceId: 'yalla.auth.deviceId',
  verificationId: 'yalla.auth.verificationId',
  onboardingComplete: 'yalla.auth.onboardingComplete',
  pushToken: 'yalla.notifications.pushToken',
} as const;

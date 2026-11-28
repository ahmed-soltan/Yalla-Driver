// src/entities/device/lib/expo-push-token.ts
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { deletePushToken, type PushPlatform } from '../api/device-api';

export const pushPlatform = (): PushPlatform => (Platform.OS === 'ios' ? 'ios' : 'android');

/** The Expo push token of this device, or null (emulator, no project id, or no permission). */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators cannot receive push
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return null;
  }
}

/** Call on logout, while the access token is still valid. */
export async function unregisterThisDevice(): Promise<void> {
  const token = await getExpoPushToken();
  if (token) await deletePushToken(token);
}

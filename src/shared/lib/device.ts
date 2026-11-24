import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { secureStorage, storageKeys } from './storage';

function createDeviceId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

async function getDeviceId() {
  const existingDeviceId = await secureStorage.get(storageKeys.deviceId);
  if (existingDeviceId) return existingDeviceId;

  const deviceId = createDeviceId();
  await secureStorage.set(storageKeys.deviceId, deviceId);
  return deviceId;
}

export async function getAuthDeviceInfo() {
  const deviceName = Device.deviceName ?? Device.modelName ?? 'Yalla Passenger';

  return {
    deviceId: await getDeviceId(),
    deviceName,
    platform: Platform.OS as 'android' | 'ios' | 'web',
    deviceModel: Device.modelName ?? deviceName,
  };
}

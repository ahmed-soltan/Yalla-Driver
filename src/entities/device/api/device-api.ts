// src/entities/device/api/device-api.ts
// Same endpoints as the passenger app (BACKEND_API_CONTRACT section 7). The backend tells
// captain from passenger by the access token.

import { request } from '@/shared/api/client';

export type PushPlatform = 'android' | 'ios';

export function registerPushToken(
  token: string,

  device: { deviceId: string; deviceName: string; deviceModel: string; platform: PushPlatform }
) {
  if (__DEV__) return Promise.resolve();
  return request<void>({
    method: 'POST',
    url: '/devices/push-tokens',
    data: { token, provider: 'EXPO', ...device },
  });
}

export function deletePushToken(token: string) {
  if (__DEV__) return Promise.resolve();
  return request<void>({ method: 'DELETE', url: '/devices/push-tokens', data: { token } });
}

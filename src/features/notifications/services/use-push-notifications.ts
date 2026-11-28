// src/features/notifications/model/use-push-notifications.ts
// Mounted once for the signed-in captain (app-shell/push-bridge.tsx).
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { registerPushToken } from '@/entities/device/api/device-api';
import { getExpoPushToken } from '@/entities/device/lib/expo-push-token';
import { captainKeys } from '@/entities/captain/model/captain-query-keys';
import { syncOpenOffers } from '@/features/offers/services/sync-open-offers';
import { isAccountType, routeForNotification, type PushData } from '../lib/notification-routes';
import { setupAndroidChannels } from './setup-notifications';
import { getAuthDeviceInfo } from '@/shared/lib/device';

async function ensurePermissionAndRegister(): Promise<void> {
  await setupAndroidChannels();
  let { status } = await Notifications.getPermissionsAsync();
  // Ask only when never asked. If the onboarding permissions screen already asks, this is a no-op.
  if (status === 'undetermined') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return;
  const token = await getExpoPushToken();
  const device = await getAuthDeviceInfo();
  if (token) await registerPushToken(token, device);
}

export function usePushNotifications() {
  const client = useQueryClient();
  const lastResponse = Notifications.useLastNotificationResponse();
  const [handledId, setHandledId] = useState<string | null>(null);

  // What a push means for the data on screen
  const applyData = (data: PushData) => {
    if (data.type === 'NEW_ORDER_REQUEST') syncOpenOffers();
    if (data.type === 'ORDER_CANCELLED') client.invalidateQueries({ queryKey: ['orders'] });
    if (isAccountType(data.type)) {
      client.invalidateQueries({ queryKey: captainKeys.verification });
      client.invalidateQueries({ queryKey: captainKeys.profile });
    }
  };

  // Register the token at start and whenever the app comes back (keeps lastSeenAt fresh and
  // picks up a changed token). The PUT is idempotent.
  useEffect(() => {
    ensurePermissionAndRegister().catch(() => {});
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') ensurePermissionAndRegister().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  // A push arrives while the app is open
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      applyData((n.request.content.data ?? {}) as PushData);
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // The captain taps a notification (also the one that opened the app from closed)
  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (id === handledId) return;
    // eslint-disable-next-line
    setHandledId(id);
    const data = (lastResponse.notification.request.content.data ?? {}) as PushData;
    applyData(data);
    const href = routeForNotification(data);
    if (href) router.push(href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse, handledId]);
}

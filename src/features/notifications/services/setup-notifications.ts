// src/features/notifications/services/setup-notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PushData } from '../lib/notification-routes';

// While the app is open: the in-app offer card is the alert for an offer, so no system banner
// for it (the sound still plays). Everything else shows a normal banner.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = (notification.request.content.data as PushData | undefined)?.type;
    const isOffer = type === 'NEW_ORDER_REQUEST';
    return {
      shouldShowBanner: !isOffer,
      shouldShowList: !isOffer,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

/**
 * Android groups notifications into channels and the sound and importance are fixed when a
 * channel is first created. The ids must match `channelId` in the backend's push payload.
 */
export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('offers', {
    name: 'طلبات جديدة',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  await Notifications.setNotificationChannelAsync('orders', {
    name: 'الطلبات الحالية',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('chat', {
    name: 'الرسائل',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('account', {
    name: 'الحساب والمستندات',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

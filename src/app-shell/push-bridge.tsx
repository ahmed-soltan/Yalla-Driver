// src/app-shell/push-bridge.tsx

import { usePushNotifications } from "@/features/notifications/services/use-push-notifications";

/** Registers for push and reacts to notifications. Renders nothing. */
export function PushBridge() {
  usePushNotifications();
  return null;
}

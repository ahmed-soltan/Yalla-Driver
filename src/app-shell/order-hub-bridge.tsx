// src/app-shell/order-hub-bridge.tsx
// Render once inside app/(app)/_layout.tsx so the hub stays connected on every screen
// (Home unmounts when the captain opens an order).
import { useCaptainOnline } from '@/features/home/services/use-captain-home';
import { useOrderHub } from '@/features/offers/services/use-order-hub';

export function OrderHubBridge() {
  const online = useCaptainOnline();
  useOrderHub(online);
  return null;
}

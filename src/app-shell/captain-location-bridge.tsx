// src/app-shell/captain-location-bridge.tsx
import { useCurrentOrder } from '@/features/active-order/service/use-active-order';
import { useCaptainOnline } from '@/features/home/services/use-captain-home';
import { useCaptainLocation } from '@/features/home/services/use-captain-location';
import { useLocationPermission } from '@/features/home/services/use-location-permission';

/** Streams the captain's position while online or while an order is unfinished. */
export function CaptainLocationBridge() {
  const { granted } = useLocationPermission();
  const online = useCaptainOnline();
  const { data: currentOrder } = useCurrentOrder();
  useCaptainLocation({ permitted: granted, streaming: online || !!currentOrder });
  return null;
}

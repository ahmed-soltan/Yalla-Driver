// src/features/offers/ui/offer-overlay.tsx
import { useHideTabBar } from '@/shared/model/tab-bar-store';
import { useOfferStore } from '../model/offer-store';
import { OfferSheet } from './offer-sheet';

/** Shows the first queued offer over the map and hides the tab bar meanwhile. */
export function OfferOverlay() {
  const offer = useOfferStore((s) => s.queue[0]);
  useHideTabBar(!!offer);
  if (!offer) return null;
  // key: a new offer gets fresh local state (counter mode, fare, countdown)
  return <OfferSheet key={offer.orderId} offer={offer} />;
}

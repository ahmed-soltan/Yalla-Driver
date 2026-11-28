// src/features/offers/services/sync-open-offers.ts
import { getOpenOffers } from '@/entities/offer/api/offer-api';
import { useOfferStore } from '../model/offer-store';

/**
 * Loads the offers that are still valid and puts them in the queue (the store ignores ones it
 * already has). Needed because neither a push notification nor a hub reconnect carries the offers
 * that were sent while the captain was away. Offers already past their deadline are skipped.
 */
export async function syncOpenOffers(): Promise<void> {
  try {
    const offers = await getOpenOffers();
    const now = Date.now();
    for (const offer of offers) {
      if (new Date(offer.expiresAt).getTime() > now) useOfferStore.getState().push(offer);
    }
  } catch {
    // Offline: the next trigger tries again
  }
}

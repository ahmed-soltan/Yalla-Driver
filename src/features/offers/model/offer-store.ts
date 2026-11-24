// src/features/offers/model/offer-store.ts
import { create } from 'zustand';
import type { OrderOffer, QueuedOffer } from '@/entities/offer/model/offer-types';

export type PendingCounter = {
  orderId: string;
  farePiastres: number;
  sentAt: number;
  expiresAt: string;
};

type OfferState = {
  queue: QueuedOffer[]; // first item is the one on screen
  counter: PendingCounter | null;
  push: (offer: OrderOffer) => void;
  remove: (orderId: string) => void;
  setCounter: (counter: PendingCounter | null) => void;
  clear: () => void;
};

export const useOfferStore = create<OfferState>((set) => ({
  queue: [],
  counter: null,
  push: (offer) =>
    set((s) =>
      s.queue.some((o) => o.orderId === offer.orderId)
        ? s
        : { queue: [...s.queue, { ...offer, receivedAt: Date.now() }] }
    ),
  remove: (orderId) =>
    set((s) => ({
      queue: s.queue.filter((o) => o.orderId !== orderId),
      counter: s.counter?.orderId === orderId ? null : s.counter,
    })),
  setCounter: (counter) => set({ counter }),
  clear: () => set({ queue: [], counter: null }),
}));

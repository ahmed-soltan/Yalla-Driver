// src/features/offers/services/order-hub.ts
import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import type { OrderOffer } from '@/entities/offer/model/offer-types';
import { secureStorage, storageKeys } from '@/shared/lib/storage';

export const USE_MOCK_HUB = __DEV__;

export type HubEventMap = {
  NewOrderRequest: OrderOffer;
  OrderRequestExpired: { orderId: string };
  OrderRequestTaken: { orderId: string };
  OrderCancelled: { orderId: string };
  OrderCounterOfferAccepted: { orderId: string };
  OrderCounterOfferRejected: { orderId: string };
  OrderCounterOfferExpired: { orderId: string };
};

export type HubHandlers = {
  [K in keyof HubEventMap]?: (payload: HubEventMap[K]) => void;
};

const mockListeners = new Set<HubHandlers>();

/** Dev only: pretend the server pushed an event. */
export function emitMockHubEvent<K extends keyof HubEventMap>(name: K, payload: HubEventMap[K]) {
  mockListeners.forEach((h) => {
    (h[name] as ((p: HubEventMap[K]) => void) | undefined)?.(payload);
  });
}

/** Connects and returns a disconnect function. */
export function connectOrderHub(handlers: HubHandlers): () => void {
  if (USE_MOCK_HUB) {
    mockListeners.add(handlers);
    return () => {
      mockListeners.delete(handlers);
    };
  }

  const url = Constants.expoConfig?.extra?.orderHubUrl as string | undefined;
  if (!url) return () => {};

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: async () => (await secureStorage.get(storageKeys.accessToken)) ?? '',
    })
    .withAutomaticReconnect()
    .build();

  (Object.keys(handlers) as (keyof HubEventMap)[]).forEach((name) => {
    const handler = handlers[name];
    if (handler) connection.on(name, handler as (...args: unknown[]) => void);
  });

  connection.start().catch(() => {});
  return () => {
    connection.stop().catch(() => {});
  };
}

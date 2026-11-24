// src/features/offers/services/use-order-hub.ts
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { useOfferStore } from '../model/offer-store';
import { activeOrderHref } from '@/shared/lib/routes';
import { connectOrderHub, emitMockHubEvent, USE_MOCK_HUB } from './order-hub';
import { makeMockOffer } from '../constants/mock-offers';

/** Listens for dispatch offers while the captain is online. */
export function useOrderHub(enabled: boolean) {
  const push = useOfferStore((s) => s.push);
  const remove = useOfferStore((s) => s.remove);
  const clear = useOfferStore((s) => s.clear);
  const client = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }
    const disconnect = connectOrderHub({
      NewOrderRequest: (offer) => {
        push(offer);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      },
      OrderRequestExpired: ({ orderId }) => {
        const wasShown = useOfferStore.getState().queue.some((o) => o.orderId === orderId);
        remove(orderId);
        if (wasShown)
          Toast.show({ type: 'info', text1: 'فاتك الطلب', text2: 'هنوصلك طلب تاني قريب.' });
      },
      OrderRequestTaken: ({ orderId }) => {
        const wasShown = useOfferStore.getState().queue.some((o) => o.orderId === orderId);
        remove(orderId);
        if (wasShown)
          Toast.show({ type: 'info', text1: 'الطلب ده اتاخد', text2: 'هنوصلك طلب تاني قريب.' });
      },
      OrderCancelled: ({ orderId }) => {
        remove(orderId);
        // If it is the order being worked on, the screen refetches and shows it cancelled.
        client.invalidateQueries({ queryKey: ['orders'] });
      },
      OrderCounterOfferAccepted: ({ orderId }) => {
        remove(orderId);
        router.replace(activeOrderHref(orderId));
      },
      OrderCounterOfferRejected: ({ orderId }) => remove(orderId),
      OrderCounterOfferExpired: ({ orderId }) => remove(orderId),
    });
    return disconnect;
  }, [enabled, push, remove, clear, client]);

  // Dev only: fake a new offer 5s after going online, then every 45s.
  useEffect(() => {
    if (!enabled || !USE_MOCK_HUB) return;
    let i = 0;
    const fire = () => emitMockHubEvent('NewOrderRequest', makeMockOffer(i++));
    const first = setTimeout(fire, 5000);
    const loop = setInterval(fire, 45000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, [enabled]);

  // Dev only: when a counteroffer is sent, the "passenger" accepts it after 6s.
  const counter = useOfferStore((s) => s.counter);
  useEffect(() => {
    if (!USE_MOCK_HUB || !counter) return;
    const t = setTimeout(
      () => emitMockHubEvent('OrderCounterOfferAccepted', { orderId: counter.orderId }),
      6000
    );
    return () => clearTimeout(t);
  }, [counter]);
}

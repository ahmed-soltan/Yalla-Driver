// src/features/offers/model/use-offer-actions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { activeOrderHref } from '@/shared/lib/routes';
import Toast from 'react-native-toast-message';
import {
  acceptOffer,
  counterOffer,
  isOfferGone,
  rejectOffer,
} from '@/entities/offer/api/offer-api';
import type { RejectReason } from '@/entities/offer/model/offer-types';
import { useOfferStore } from './offer-store';

function toastGone() {
  Toast.show({ type: 'error', text1: 'الطلب ده اتاخد أو انتهى', text2: 'هنوصلك طلب تاني قريب.' });
}

export function useOfferActions() {
  const client = useQueryClient();
  const remove = useOfferStore((s) => s.remove);
  const setCounter = useOfferStore((s) => s.setCounter);

  const accept = useMutation({
    mutationFn: (orderId: string) => acceptOffer(orderId),
    onSuccess: ({ orderId }) => {
      remove(orderId);
      client.invalidateQueries({ queryKey: ['captain', 'today'] });
      router.replace(activeOrderHref(orderId));
    },
    onError: (error, orderId) => {
      if (isOfferGone(error)) {
        remove(orderId);
        toastGone();
      }
    },
  });

  // Declining always dismisses locally, even if the request fails.
  const reject = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: RejectReason }) =>
      rejectOffer(orderId, reason),
    onSettled: (_d, _e, vars) => remove(vars.orderId),
  });

  const counter = useMutation({
    mutationFn: ({ orderId, farePiastres }: { orderId: string; farePiastres: number }) =>
      counterOffer(orderId, { captainCounterFarePiastres: farePiastres }),
    onSuccess: (c, vars) =>
      setCounter({
        orderId: vars.orderId,
        farePiastres: c.captainCounterFarePiastres,
        sentAt: Date.now(),
        expiresAt: c.expiresAt,
      }),
    onError: (error, vars) => {
      if (isOfferGone(error)) {
        remove(vars.orderId);
        toastGone();
      }
    },
  });

  return { accept, reject, counter };
}

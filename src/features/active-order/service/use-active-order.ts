// src/features/active-order/model/use-active-order.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelOrder,
  completeOrder,
  getActiveOrder,
  getCurrentActiveOrder,
  markArrived,
  startOrder,
  submitReceipt,
} from '@/entities/order/api/active-order-api';
import type { ActiveOrder, CancelReason } from '@/entities/order/model/active-order-types';

export const activeOrderKey = (id: string) => ['orders', 'active', id] as const;
export const CURRENT_ORDER_KEY = ['orders', 'current'] as const;

export function useCurrentOrder() {
  return useQuery({ queryKey: CURRENT_ORDER_KEY, queryFn: getCurrentActiveOrder });
}

export function useActiveOrder(orderId: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: activeOrderKey(orderId),
    queryFn: () => getActiveOrder(orderId),
  });

  // Every action returns the updated order. The server stays the source of truth.
  const apply = (order: ActiveOrder) => {
    client.setQueryData(activeOrderKey(orderId), order);
    client.invalidateQueries({ queryKey: CURRENT_ORDER_KEY });
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      client.invalidateQueries({ queryKey: ['captain', 'today'] });
      client.invalidateQueries({ queryKey: ['orders', 'history'] });
    }
  };

  const arrived = useMutation({ mutationFn: () => markArrived(orderId), onSuccess: apply });
  const start = useMutation({
    mutationFn: (collected?: number) => startOrder(orderId, collected),
    onSuccess: apply,
  });
  const complete = useMutation({
    mutationFn: (collected?: number) => completeOrder(orderId, collected),
    onSuccess: apply,
  });
  const cancel = useMutation({
    mutationFn: (reason: CancelReason) => cancelOrder(orderId, reason),
    onSuccess: apply,
  });
  const receipt = useMutation({
    // The shared ImageUploader has already uploaded the photo and gives us its fileId.
    mutationFn: ({ fileId, amountPiastres }: { fileId: string; amountPiastres: number }) =>
      submitReceipt(orderId, { fileId, amountPiastres, purchasedAt: new Date().toISOString() }),
    onSuccess: apply,
  });

  const busy =
    arrived.isPending ||
    start.isPending ||
    complete.isPending ||
    cancel.isPending ||
    receipt.isPending;
  const failed = arrived.isError || start.isError || complete.isError || cancel.isError;

  return { query, arrived, start, complete, cancel, receipt, busy, failed };
}

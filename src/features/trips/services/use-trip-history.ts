// src/features/trips/model/use-trip-history.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getOrderHistory } from '@/entities/order/api/order-api';
import type { OrderHistoryFilter } from '@/entities/order/model/order-types';

export function useTripHistory(filter: OrderHistoryFilter) {
  return useInfiniteQuery({
    queryKey: ['orders', 'history', filter],
    queryFn: ({ pageParam }) => getOrderHistory({ filter, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

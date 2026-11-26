// src/features/active-order/model/use-order-route.ts
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderRoute } from '@/entities/order/api/order-route-api';
import type { ActiveOrder } from '@/entities/order/model/active-order-types';
import { decodePolyline, minDistanceToPolyline, type LatLng } from '@/shared/lib/polyline';
import { getStep } from '../model/order-steps';

/** The captain is this far from the line: the road he is on is not the one we drew. */
const OFF_ROUTE_METERS = 150;
/** Never ask for a new route more often than this (each request is billed by the provider). */
const MIN_REROUTE_GAP_MS = 20000;

export type OrderRouteView = {
  coordinates: LatLng[];
  distanceMeters: number | null;
  durationSeconds: number | null;
  /** Changes when the captain moves on to the next stop (pickup -> destination). */
  legKey: string;
};

/**
 * The road from the captain to his next stop: the pickup until he has picked up,
 * then the destination. Requested once per stop, and again only if he leaves the road.
 * Call it before any early return in the screen (it is a hook); `order` may be undefined.
 */
export function useOrderRoute(
  order: ActiveOrder | undefined,
  position: LatLng | null
): OrderRouteView | null {
  const target = order ? (getStep(order)?.target ?? null) : null;
  const orderId = order?.orderId;
  const legKey = orderId && target ? `${orderId}:${target}` : null;
  const targetPlace =
    order && target ? (target === 'pickup' ? order.pickup : order.destination) : null;

  // Where the current route was requested from. A new stop starts a new anchor.
  const [anchor, setAnchor] = useState<{ legKey: string; origin: LatLng; at: number } | null>(null);

  useEffect(() => {
    if (!legKey || !position) return;
    if (!anchor || anchor.legKey !== legKey)
      // eslint-disable-next-line
      setAnchor({ legKey, origin: position, at: Date.now() });
  }, [legKey, position, anchor]);

  const origin = anchor && anchor.legKey === legKey ? anchor.origin : null;

  const query = useQuery({
    queryKey: ['orders', 'route', legKey, origin?.latitude, origin?.longitude],
    queryFn: () => {
      if (!orderId || !target || !origin || !targetPlace) throw new Error('route is not available');
      return getOrderRoute({
        orderId,
        target: target === 'pickup' ? 'PICKUP' : 'DESTINATION',
        origin,
        targetPoint: { latitude: targetPlace.location.lat, longitude: targetPlace.location.lng },
      });
    },
    enabled: !!legKey && !!origin && !!targetPlace,
    staleTime: Infinity,
    retry: 1,
    // While re-routing keep drawing the old line, but never the previous stop's line
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === legKey ? previous : undefined,
  });

  const coordinates = useMemo(
    () => (query.data ? decodePolyline(query.data.polyline) : []),
    [query.data]
  );

  // Left the road: ask for a new route from where he is now
  useEffect(() => {
    if (!position || !anchor || anchor.legKey !== legKey || coordinates.length < 2) return;
    if (Date.now() - anchor.at < MIN_REROUTE_GAP_MS) return;
    if (minDistanceToPolyline(position, coordinates) > OFF_ROUTE_METERS) {
      // eslint-disable-next-line
      setAnchor({ legKey: anchor.legKey, origin: position, at: Date.now() });
    }
  }, [position, anchor, legKey, coordinates]);

  if (!legKey) return null;
  return {
    coordinates,
    distanceMeters: query.data?.distanceMeters ?? null,
    durationSeconds: query.data?.durationSeconds ?? null,
    legKey,
  };
}

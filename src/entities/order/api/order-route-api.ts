// src/entities/order/api/order-route-api.ts
import { distanceMeters, encodePolyline, type LatLng } from '@/shared/lib/polyline';
import type { OrderRoute, RouteTarget } from '@/entities/order/model/route-types';
import { request } from '@/shared/api/client';

// One switch for this feature. Flip to false to hit the real backend.
const USE_MOCK = __DEV__;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dev only: a gently curved line from A to B that looks like a road. */
function mockRoute(origin: LatLng, to: LatLng): OrderRoute {
  const steps = 28;
  const dLat = to.latitude - origin.latitude;
  const dLng = to.longitude - origin.longitude;
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bend = Math.sin(t * Math.PI) * 0.12; // sideways wobble, zero at both ends
    points.push({
      latitude: origin.latitude + dLat * t - dLng * bend * 0.35,
      longitude: origin.longitude + dLng * t + dLat * bend * 0.35,
    });
  }
  let meters = 0;
  for (let i = 1; i < points.length; i++) meters += distanceMeters(points[i - 1], points[i]);
  return {
    polyline: encodePolyline(points),
    distanceMeters: Math.round(meters),
    durationSeconds: Math.round(meters / 8.3), // about 30 km/h
  };
}

/**
 * GET /orders/{orderId}/route. The backend owns the routing provider and its API key.
 * `targetPoint` is only used by the dev mock; the server resolves it from `target`.
 */
export async function getOrderRoute(params: {
  orderId: string;
  target: RouteTarget;
  origin: LatLng;
  targetPoint: LatLng;
}): Promise<OrderRoute> {
  if (USE_MOCK) {
    await wait(300);
    return mockRoute(params.origin, params.targetPoint);
  }
  return request<OrderRoute>({
    method: 'GET',
    url: `/orders/${params.orderId}/route`,
    params: {
      originLat: params.origin.latitude,
      originLng: params.origin.longitude,
      target: params.target,
    },
  });
}

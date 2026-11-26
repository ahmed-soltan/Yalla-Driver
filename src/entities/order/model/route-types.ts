// src/entities/order/model/route-types.ts
// Mirrors docs/CAPTAIN_API_CONTRACT.md, "Route to the next stop".
export type RouteTarget = 'PICKUP' | 'DESTINATION';

export type OrderRoute = {
  polyline: string; // Google encoded polyline, precision 5
  distanceMeters: number;
  durationSeconds: number;
};

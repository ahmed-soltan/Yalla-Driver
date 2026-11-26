// src/features/home/services/location-sender.ts
// The only code that calls POST /captain/location. The foreground timer and the background
// task both go through flushLocation(), so the backend gets one request per ~5 seconds
// no matter how many GPS sources are running.
import { sendLocation } from '@/entities/home/api/home-api';
import { CaptainLocationPoint } from '@/entities/home/model/home-types';
import type { LocationObjectCoords } from 'expo-location';

/** How often the foreground timer tries to send. */
export const LOCATION_SEND_INTERVAL_MS = 5000;
/** Two sends are never closer than this (absorbs the foreground timer + background task overlap). */
const MIN_GAP_MS = 4500;
/** A fix older than this is not sent: Redis then expires and passengers see "location unknown". */
const MAX_FIX_AGE_MS = 20000;

let latest: CaptainLocationPoint | null = null;
let latestFixAt = 0;
let lastAttemptAt = 0;
let inFlight = false;

export function toLocationPoint(c: LocationObjectCoords): CaptainLocationPoint {
  return {
    latitude: c.latitude,
    longitude: c.longitude,
    heading: c.heading != null && c.heading >= 0 && c.heading <= 360 ? c.heading : null,
    speed: c.speed != null && c.speed >= 0 ? c.speed : null,
  };
}

/** Remember the newest GPS fix. Does not send. */
export function feedLocation(point: CaptainLocationPoint) {
  latest = point;
  latestFixAt = Date.now();
}

/** Forget the position when tracking stops, so a stale one is never sent later. */
export function clearLocation() {
  latest = null;
  latestFixAt = 0;
}

/**
 * Sends the newest fix if: nothing is in flight, the last attempt was at least MIN_GAP_MS ago,
 * and the fix is fresh. A failed request is simply dropped: the next tick sends a newer
 * position, which is more useful than retrying an old one.
 */
export async function flushLocation(): Promise<void> {
  const now = Date.now();
  if (inFlight || !latest) return;
  if (now - lastAttemptAt < MIN_GAP_MS) return;
  if (now - latestFixAt > MAX_FIX_AGE_MS) return;

  inFlight = true;
  lastAttemptAt = now;
  try {
    await sendLocation(latest);
  } catch {
    // Offline or server error: wait for the next tick.
  } finally {
    inFlight = false;
  }
}

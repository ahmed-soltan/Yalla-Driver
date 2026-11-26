// src/features/home/services/use-captain-location.ts
// Mounted once in the app shell (see app-shell/captain-location-bridge.tsx), NOT in a screen,
// so tracking keeps running when Home unmounts (e.g. during an active order).
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { startBackgroundLocation, stopBackgroundLocation } from './background-location-task';
import {
  LOCATION_SEND_INTERVAL_MS,
  clearLocation,
  feedLocation,
  flushLocation,
  toLocationPoint,
} from './location-sender';
import { useLocationStore } from '../model/use-location-store';

/**
 * Always tracks the position for the map while permitted.
 * While `streaming` is true (online, or working on an order) the newest fix is sent to
 * POST /captain/location through location-sender: one request every ~5 seconds, never
 * overlapping, never from SignalR. The background task feeds the same sender.
 */
export function useCaptainLocation({
  permitted,
  streaming,
}: {
  permitted: boolean;
  streaming: boolean;
}) {
  const setPosition = useLocationStore((s) => s.setPosition);
  const setBackgroundActive = useLocationStore((s) => s.setBackgroundActive);

  // GPS for the map. Each fix is also remembered for the sender (it does not send by itself).
  useEffect(() => {
    if (!permitted) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | undefined;

    (async () => {
      const s = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: 4000 },
        (loc) => {
          setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          feedLocation(toLocationPoint(loc.coords));
        }
      );
      if (cancelled) s.remove();
      else sub = s;
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [permitted, setPosition]);

  // The heartbeat: one request every 5 s while streaming, even if the captain is stationary
  // (so Redis does not expire). Stops, and forgets the position, when streaming ends.
  useEffect(() => {
    if (!permitted || !streaming) {
      clearLocation();
      return;
    }
    flushLocation();
    const id = setInterval(() => flushLocation(), LOCATION_SEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [permitted, streaming]);

  // Background updates keep the OS delivering fixes when the app is not in front.
  useEffect(() => {
    if (!permitted || !streaming) {
      stopBackgroundLocation().catch(() => {});
      setBackgroundActive(false);
      return;
    }
    let cancelled = false;
    startBackgroundLocation()
      .then((ok) => !cancelled && setBackgroundActive(ok))
      .catch(() => !cancelled && setBackgroundActive(false));
    return () => {
      cancelled = true;
    };
  }, [permitted, streaming, setBackgroundActive]);

  // Logout / shell unmount: stop the background task
  useEffect(
    () => () => {
      stopBackgroundLocation().catch(() => {});
    },
    []
  );
}

// src/features/home/services/use-captain-location.ts
// Mounted once in the app shell (see app-shell/captain-runtime.tsx), NOT in a screen,
// so tracking keeps running when Home unmounts (e.g. during an active order).
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { startBackgroundLocation, stopBackgroundLocation } from './background-location-task';
import { useLocationStore } from '../model/use-location-store';
import { sendLocation } from '@/entities/home/api/home-api';

/**
 * Always tracks the position for the map while permitted.
 * While `streaming` is true (online, or working on an order) it also sends it to the
 * backend: background task when permitted, otherwise foreground only.
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
  const backgroundActive = useLocationStore((s) => s.backgroundActive);

  // Position for the map (and foreground sending when background is not running)
  useEffect(() => {
    if (!permitted) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | undefined;

    (async () => {
      const s = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: 4000 },
        (loc) => {
          setPosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (streaming && !backgroundActive) {
            sendLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              heading: loc.coords.heading,
              speed: loc.coords.speed,
              accuracy: loc.coords.accuracy,
              recordedAt: loc.timestamp,
            }).catch(() => {});
          }
        }
      );
      if (cancelled) s.remove();
      else sub = s;
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [permitted, streaming, backgroundActive, setPosition]);

  // Background streaming
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

// src/features/home/services/background-location-task.ts
// IMPORTANT: import this file once from app/_layout.tsx (side-effect import) so the
// task is defined when the OS wakes the app in the background.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { feedLocation, flushLocation, toLocationPoint } from './location-sender';

export const CAPTAIN_LOCATION_TASK = 'yalla-captain-location';

TaskManager.defineTask(CAPTAIN_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const last = locations[locations.length - 1];
  if (!last) return;
  // Same sender as the foreground timer: it dedupes, never overlaps, and sends at most
  // one request per ~5 seconds. The JS timer may be suspended in the background, so the
  // task flushes itself whenever the OS wakes it with a new fix.
  feedLocation(toLocationPoint(last.coords));
  await flushLocation();
});

/** Returns true if background updates are running. False means foreground only. */
export async function startBackgroundLocation(): Promise<boolean> {
  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) return false;
  if (await Location.hasStartedLocationUpdatesAsync(CAPTAIN_LOCATION_TASK)) return true;
  await Location.startLocationUpdatesAsync(CAPTAIN_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
    distanceInterval: 25,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'يلا كابتن',
      notificationBody: 'أنت أونلاين وبتستقبل الطلبات',
    },
  });
  return true;
}

export async function stopBackgroundLocation(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(CAPTAIN_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(CAPTAIN_LOCATION_TASK);
  }
}

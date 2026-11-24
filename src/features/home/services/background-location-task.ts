// src/features/home/services/background-location-task.ts
// IMPORTANT: import this file once from app/_layout.tsx (side-effect import) so the
// task is defined when the OS wakes the app in the background.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { sendLocation } from '@/entities/home/api/home-api';

export const CAPTAIN_LOCATION_TASK = 'yalla-captain-location';

TaskManager.defineTask(CAPTAIN_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const last = locations[locations.length - 1];
  if (!last) return;
  try {
    await sendLocation({
      latitude: last.coords.latitude,
      longitude: last.coords.longitude,
      heading: last.coords.heading,
      speed: last.coords.speed,
      accuracy: last.coords.accuracy,
      recordedAt: last.timestamp,
    });
  } catch {
    // Next tick will send a fresh point. Nothing to retry here.
  }
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

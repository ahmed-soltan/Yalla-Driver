import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function getLocationPermissionStatus(): Promise<PermissionStatus> {
  try {
    const result = await Location.getForegroundPermissionsAsync();
    return result.status;
  } catch {
    return 'unavailable';
  }
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const result = await Location.requestForegroundPermissionsAsync();
    return result.status;
  } catch {
    return 'unavailable';
  }
}

export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  try {
    const result = await Notifications.getPermissionsAsync();
    return result.status;
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    const result = await Notifications.requestPermissionsAsync();
    return result.status;
  } catch {
    return 'unavailable';
  }
}

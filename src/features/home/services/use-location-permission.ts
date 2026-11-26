// src/features/home/services/use-location-permission.ts
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';

let foregroundPermissionRequest: ReturnType<
  typeof Location.requestForegroundPermissionsAsync
> | null = null;

function requestForegroundPermission() {
  if (!foregroundPermissionRequest) {
    foregroundPermissionRequest = Location.requestForegroundPermissionsAsync();
  }
  return foregroundPermissionRequest.finally(() => {
    foregroundPermissionRequest = null;
  });
}

export function useLocationPermission() {
  const [granted, setGranted] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(async () => {
    const p = await Location.getForegroundPermissionsAsync();
    setGranted(p.granted);
    setCanAskAgain(p.canAskAgain);
    setChecked(true);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const current = await Location.getForegroundPermissionsAsync();
      if (!current.granted && current.canAskAgain) {
        const requested = await requestForegroundPermission();
        setGranted(requested.granted);
        setCanAskAgain(requested.canAskAgain);
        setChecked(true);
        return;
      }
      setGranted(current.granted);
      setCanAskAgain(current.canAskAgain);
      setChecked(true);
    };
    initialize();
    // Re-check when he comes back from system settings
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    const p = await requestForegroundPermission();
    setGranted(p.granted);
    setCanAskAgain(p.canAskAgain);
    return p.granted;
  }, []);

  const fix = useCallback(async () => {
    if (canAskAgain) await request();
    else await Linking.openSettings();
  }, [canAskAgain, request]);

  return { granted, checked, fix };
}

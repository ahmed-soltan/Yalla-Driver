// src/features/home/services/use-location-permission.ts
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';

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
    // eslint-disable-next-line
    refresh();
    // Re-check when he comes back from system settings
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    const p = await Location.requestForegroundPermissionsAsync();
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

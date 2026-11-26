import '@shared/config/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';

import { PortalHost } from '@rn-primitives/portal';

import { AppProviders } from '@/app-layer/providers/app-providers';
import { useAuthBootstrap } from '@/app-layer/navigation/use-auth-bootstrap';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NotificationListener } from '@/shared/lib/notification-listener';
import { NetworkStatusListener } from '@/shared/ui/network-listener';
import { useNetworkStatus } from '@/shared/hooks/use-network-status';
import { AppVersionGate } from '@/shared/ui/app-version-gate';
import { useAppVersionCheck } from '@/shared/hooks/use-app-version-check';
import '@/features/home/services/background-location-task';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo: require('../assets/static/Cairo-Regular.ttf'),
    CairoMedium: require('../assets/static/Cairo-Medium.ttf'),
    CairoSemiBold: require('../assets/static/Cairo-SemiBold.ttf'),
    CairoBold: require('../assets/static/Cairo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { isConnected } = useNetworkStatus();
  const { isReady } = useAuthBootstrap();
  const updateState = useAppVersionCheck(isReady);

  if (!isReady) {
    return null;
  }

  if (!isConnected) {
    return <NetworkStatusListener />;
  }

  return (
    <AppVersionGate updateState={updateState}>
      <KeyboardProvider>
        <StatusBar style="dark" />
        <NotificationListener />
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
      <PortalHost />
      <Toast />
    </AppVersionGate>
  );
}

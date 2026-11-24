// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { CaptainTabBar } from '@/shared/ui/captain-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CaptainTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

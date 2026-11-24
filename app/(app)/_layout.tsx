import { Tabs } from 'expo-router';
import { ClipboardList, Map as MapIcon, UserRound, WalletCards } from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { VerificationScreen } from '@/screens/captain/verification-screen';
import { useCaptainVerification } from '@/features/captain/services/use-captain-verification';
import { ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';

const tabIcon =
  (Icon: typeof MapIcon) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon color={String(color)} size={size} />
  );

export default function CaptainAppLayout() {
  const verification = useCaptainVerification();

  if (verification.isPending) {
    return (
      <ScreenLayout back={false}>
        <Text className="mt-8 w-full text-right text-muted-foreground">
          جاري تحميل حالة التحقق...
        </Text>
      </ScreenLayout>
    );
  }

  if (verification.data?.status !== 'VERIFIED') {
    return <VerificationScreen locked />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E8754F',
        tabBarInactiveTintColor: '#8A949E',
        tabBarLabelStyle: { fontFamily: 'Cairo', fontSize: 10 },
        tabBarStyle: {
          borderTopColor: '#E1E5EA',
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen name="profile" options={{ title: 'حسابي', tabBarIcon: tabIcon(UserRound) }} />
      <Tabs.Screen
        name="earnings"
        options={{ title: 'الأرباح', tabBarIcon: tabIcon(WalletCards) }}
      />
      <Tabs.Screen
        name="trips"
        options={{ title: 'الرحلات', tabBarIcon: tabIcon(ClipboardList) }}
      />
      <Tabs.Screen name="home" options={{ title: 'الرئيسية', tabBarIcon: tabIcon(MapIcon) }} />
      <Tabs.Screen name="(tabs)" options={{ href: null }} />
      <Tabs.Screen name="chat/[orderId]" options={{ href: null }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="verification" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="terms" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profile/documents" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/vehicle" options={{ href: null }} />
      <Tabs.Screen name="profile/documents/[type]" options={{ href: null }} />
    </Tabs>
  );
}

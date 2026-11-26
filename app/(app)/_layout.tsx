import { Tabs } from 'expo-router';

import { VerificationScreen } from '@/screens/captain/verification-screen';
import { useCaptainVerification } from '@/features/captain/services/use-captain-verification';
import { ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';
import { CaptainRuntime } from '@/app-shell/captain-runtime';
import { CaptainTabBar } from '@/shared/ui/captain-tab-bar';
import { ActiveOrderBanner } from '@/features/active-order/ui/active-order-banner';
import { OfferOverlay } from '@/features/offers/ui/offer-overlay';

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
    <>
      <CaptainRuntime />
      <Tabs tabBar={(props) => <CaptainTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="trips" />
        <Tabs.Screen name="stats" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="earnings" options={{ href: null }} />
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

      <ActiveOrderBanner />
      <OfferOverlay />
    </>
  );
}

import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import {
  requestLocationPermission,
  requestNotificationPermission,
} from '@/shared/permissions/permissions';
import { useAuthStore } from '@/shared/hooks/auth-store';

const route = (path: string) => path as never;

export function PermissionsScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'location' | 'notifications'>('location');
  const [busy, setBusy] = useState(false);
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);
  const isLocation = step === 'location';

  const continueOnboarding = async (requestPermission: boolean) => {
    setBusy(true);

    if (requestPermission) {
      if (isLocation) await requestLocationPermission();
      else await requestNotificationPermission();
    }

    if (isLocation) {
      setStep('notifications');
    } else {
      await setOnboardingComplete();
      router.replace(route('/(app)/home'));
    }

    setBusy(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-end justify-center p-6">
        <View className="mb-4 flex-row-reverse  items-center justify-end gap-2">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text className="text-sm font-semibold text-muted-foreground">
            {isLocation ? 'الخطوة ١ من ٢' : 'الخطوة ٢ من ٢'}
          </Text>
        </View>
        <Text variant="h3" className="w-full text-right text-2xl font-bold">
          {isLocation ? 'شارك موقعك أثناء العمل' : 'خليك على اطلاع دائم'}
        </Text>
        <Text variant="muted" className="mt-2 w-full text-right text-base leading-7">
          {isLocation
            ? 'موقعك بيساعدنا نعرضلك الرحلات القريبة منك ونوجه العملاء لمكانك بدقة أثناء عملك.'
            : 'هنبعتلك إشعارات مهمة عن طلبات الرحلات، حالة حسابك، ونتيجة مراجعة بياناتك ومستنداتك.'}
        </Text>

        <View className="my-6 w-full flex-1 items-center justify-center">
          {isLocation ? (
            <Image
              source={require('../../../assets/address-pana.png')}
              contentFit="contain"
              style={{ width: 350, height: 350 }}
            />
          ) : (
            <Image
              source={require('../../../assets/notifications.png')}
              contentFit="contain"
              style={{ width: 350, height: 350 }}
            />
          )}
        </View>

        <Button
          className="mt-3 min-h-14 w-full rounded-2xl"
          size="lg"
          disabled={busy}
          onPress={() => continueOnboarding(true)}>
          <Text className="font-bold text-primary-foreground">
            {busy ? 'جاري التنفيذ...' : isLocation ? 'السماح بمشاركة الموقع' : 'تفعيل الإشعارات'}
          </Text>
        </Button>
        <Button
          className="mt-3 min-h-14 w-full rounded-2xl"
          size="lg"
          variant="muted"
          disabled={busy}
          onPress={() => continueOnboarding(false)}>
          <Text className="font-bold text-black">ليس الآن</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

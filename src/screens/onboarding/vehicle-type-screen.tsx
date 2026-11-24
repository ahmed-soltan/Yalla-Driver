import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { ScreenHeader } from '@/shared/ui/screen-layout';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;
const vehicleTypes = [
  { value: 'CAR', label: 'عربيه', image: require('../../../assets/car-2.png') },
  { value: 'MOTORCYCLE', label: 'موتوسيكل', image: require('../../../assets/motorcycle.png') },
  { value: 'SCOOTER', label: 'سكوتر', image: require('../../../assets/scooter.png') },
  { value: 'BICYCLE', label: 'عجله', image: require('../../../assets/bike.png') },
] as const;

export function VehicleTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingLayout currentStep={2}>
      <ScreenHeader
        title="أختار نوع المركبة"
        subtitle="اختار المركبة اللي هتشتغل بيها مع يلا."
        back={false}
      />
      <View className="w-full">
        {vehicleTypes.map((vehicle) => (
          <Pressable
            key={vehicle.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === vehicle.value }}
            className={`mb-1 flex-row-reverse  items-center gap-3 rounded-md border-b border-border px-1 py-3 ${
              selected === vehicle.value ? 'bg-secondary/10' : ''
            }`}
            onPress={() => setSelected(vehicle.value)}>
            <Image source={vehicle.image} contentFit="contain" style={{ width: 58, height: 48 }} />
            <View className="flex-1 items-end">
              <Text className="w-full text-right text-base font-semibold">{vehicle.label}</Text>
              <Text className="mt-1 w-full text-right text-xs text-muted-foreground">
                {vehicle.value === 'CAR'
                  ? 'سيارة خاصة أو تاكسي'
                  : vehicle.value === 'MOTORCYCLE'
                    ? 'رخصة دراجة نارية مطلوبة'
                    : vehicle.value === 'SCOOTER'
                      ? 'سكوتر كهربائي أو بنزين'
                      : 'لا توجد بيانات مركبة إضافية'}
              </Text>
            </View>
            <View
              className={`size-5 rounded-full border-2 ${
                selected === vehicle.value ? 'border-secondary bg-secondary' : 'border-border'
              }`}
            />
          </Pressable>
        ))}
      </View>
      <View className="flex-1" />
      <Button
        className="mt-6 min-h-14 w-full rounded-2xl"
        size="lg"
        disabled={!selected}
        onPress={() => {
          router.push({
            pathname: route('/onboarding/vehicle-details'),
            params: { ...params, vehicleType: selected },
          });
        }}>
        <Text className="font-bold text-primary-foreground">متابعة</Text>
      </Button>
    </OnboardingLayout>
  );
}

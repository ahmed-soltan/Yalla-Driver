import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { ScreenLayout } from '@/shared/ui/screen-layout';
import { Image } from 'expo-image';
import { CarFront, MapPin, WalletCards } from 'lucide-react-native';

const route = (path: string) => path as never;

export function WelcomeScreen() {
  const router = useRouter();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(24));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <ScreenLayout back={false}>
      <Animated.View
        className="flex-1 items-end justify-start pb-2"
        style={{ opacity, transform: [{ translateY }] }}>
        <View className="w-full flex-1 items-center">
          <Image
            source={require('../../../assets/captain-welcome-2.png')}
            contentFit="contain"
            style={{ width: '100%', height: 450 }}
          />

          <View className="mt-1 w-full items-end">
            <View className="w-full flex-row-reverse  items-center">
              <Text
                variant="h2"
                className="flex-1 text-right font-semibold leading-10"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                ابدأ شغلك مع
                <Text variant="h2" className="font-bold text-primary">
                  {' '}
                  يلا كابتن
                </Text>
              </Text>
            </View>

            <Text variant="muted" className="mt-1 w-full text-right text-base leading-7">
              اشتغل ككابتن مع يلا وخد رحلات أكتر في منطقتك.
            </Text>
          </View>

          <View className="mt-5 w-full flex-row-reverse  items-center justify-between rounded-2xl border border-border/60 bg-card px-3 py-3 shadow-sm shadow-black/5">
            <View className="flex-1 items-center">
              <View className="mb-1 h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <WalletCards color="#E8754D" size={18} />
              </View>
              <Text className="text-center text-xs font-semibold text-foreground">اكسب أكتر</Text>
            </View>
            <View className="h-10 w-px bg-border" />
            <View className="flex-1 items-center">
              <View className="mb-1 h-9 w-9 items-center justify-center rounded-full bg-secondary/15">
                <MapPin color="#34877D" size={18} />
              </View>
              <Text className="text-center text-xs font-semibold text-foreground">
                رحلات حواليك
              </Text>
            </View>
            <View className="h-10 w-px bg-border" />
            <View className="flex-1 items-center">
              <View className="mb-1 h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <CarFront color="#E8754D" size={18} />
              </View>
              <Text className="text-center text-xs font-semibold text-foreground">
                اشتغل براحتك
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 w-full">
          <Button
            className="min-h-14 w-full rounded-2xl shadow-sm shadow-primary/20"
            size="lg"
            onPress={() => router.push(route('/(auth)/phone?mode=signup'))}>
            <Text className="font-bold text-white">سجّل ككابتن</Text>
          </Button>

          <Button
            className="mt-3 min-h-14 w-full rounded-2xl border border-border"
            size="lg"
            variant="muted"
            onPress={() => router.push(route('/(auth)/phone?mode=login'))}>
            <Text className="font-bold text-foreground">عندك حساب؟ سجّل دخول</Text>
          </Button>
        </View>
      </Animated.View>
    </ScreenLayout>
  );
}

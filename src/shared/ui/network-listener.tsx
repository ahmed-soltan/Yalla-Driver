import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { RotateCw, WifiOff } from 'lucide-react-native';

import { Text } from '@shared/ui/text/text';

export function NetworkStatusListener() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [scale] = useState(() => new Animated.Value(0.8));
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  // Pulsing ring behind the icon only while actually offline — signals
  // "still listening for a connection" rather than a dead, static screen.
  useEffect(() => {
    if (!isOffline) return;

    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isOffline, scale, opacity]);

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    setIsChecking(true);
    const state = await NetInfo.fetch();
    setIsOffline(!state.isConnected);
    setIsChecking(false);
  };

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-background/95 px-8">
      <View className="w-full max-w-[300px] items-center gap-4 rounded-3xl border border-border bg-card px-6 py-8 shadow-sm shadow-black/5">
        <View className="h-16 w-16 items-center justify-center">
          <Animated.View
            style={{
              position: 'absolute',
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#2563EB',
              opacity,
              transform: [{ scale }],
            }}
          />

          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <WifiOff size={24} color="#2563EB" />
          </View>
        </View>

        <View className="gap-1.5">
          <Text className="text-center font-cairo-bold text-base text-foreground">
            لا يوجد اتصال بالإنترنت
          </Text>

          <Text className="max-w-[240px] text-center text-xs leading-6 text-muted-foreground">
            تحقق من اتصالك بالإنترنت، وسنعاود المحاولة تلقائيًا فور عودته.
          </Text>
        </View>

        <Pressable
          onPress={handleRetry}
          disabled={isChecking}
          className="mt-1 flex-row-reverse items-center gap-2 rounded-2xl bg-primary px-5 py-3 active:opacity-70">
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <RotateCw size={14} color="#FFFFFF" />
          )}

          <Text className="font-cairo-bold text-xs text-primary-foreground">
            {isChecking ? 'جارٍ التحقق...' : 'إعادة المحاولة'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';

export function ScreenLayout({
  children,
  back = true,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-5 pb-5 pt-4"
          keyboardShouldPersistTaps="handled">
          <View className="items-end">
            {back && (
              <Pressable accessibilityLabel="رجوع" onPress={() => router.back()} hitSlop={12}>
                <ArrowRight color="#1F2933" size={24} />
              </Pressable>
            )}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  back = true,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const router = useRouter();

  return (
    <View className="flex-row-reverse items-start gap-4 px-6">
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          onPress={() => router.back()}
          hitSlop={12}
          className="self-center rounded-full border border-gray-400 p-2">
          <ArrowRight color="#1F2933" size={20} />
        </Pressable>
      ) : null}
      <View className="flex-1 items-center gap-1">
        <Text variant="h2" className="w-full text-right font-bold leading-relaxed">
          {title}
        </Text>
        {subtitle && (
          <Text variant="muted" className="text-md w-full text-right leading-9">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

export function ScreenError({ message }: { message?: string }) {
  return message ? (
    <Text className="mb-2 w-full text-right text-sm text-destructive">{message}</Text>
  ) : null;
}

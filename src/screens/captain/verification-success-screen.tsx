import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;

export function VerificationSuccessScreen() {
  const router = useRouter();

  return (
    <ScreenLayout back={false}>
      <View className="flex-1 items-center justify-center px-2">
        <View className="mb-8 size-44 items-center justify-center rounded-full bg-success/10">
          <View className="size-24 items-center justify-center rounded-full bg-success">
            <CheckCircle2 color="#FFFFFF" size={56} strokeWidth={2.5} />
          </View>
        </View>

        <Text className="mb-3 text-center text-3xl font-bold text-foreground">
          تم التحقق من حسابك بنجاح
        </Text>
        <Text className="max-w-[320px] text-center text-base leading-7 text-muted-foreground">
          تم اعتماد بياناتك ومستنداتك. يمكنك الآن استخدام التطبيق واستقبال الرحلات.
        </Text>
      </View>

      <View className="w-full border-t border-border/70 pt-4">
        <Button
          className="min-h-14 w-full rounded-2xl"
          size="lg"
          onPress={() => router.replace(route('/(app)/home'))}>
          <Text className="font-bold text-primary-foreground">الدخول إلى التطبيق</Text>
        </Button>
      </View>
    </ScreenLayout>
  );
}

import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;

export function SuccessScreen() {
  const router = useRouter();
  return (
    <OnboardingLayout currentStep={4} completed back={false}>
      <View className="flex-1 items-center justify-center px-2">
        <View className="mb-8 size-44 items-center justify-center rounded-full bg-success/10">
          <View className="size-24 items-center justify-center rounded-full bg-success">
            <Check size={54} color="white" strokeWidth={3} />
          </View>
        </View>
        <Text className="mb-3 text-center text-3xl font-bold text-foreground">
          تم إرسال طلبك بنجاح
        </Text>
        <Text className="max-w-[320px] text-center text-base leading-7 text-muted-foreground">
          طلبك الآن قيد المراجعة. هنراجع بياناتك ومستنداتك وهنبلغك أول ما يتم تفعيل حسابك.
        </Text>
        <View className="mt-8 w-full flex-row-reverse  items-center justify-center gap-2 rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3">
          <View className="size-2 rounded-full bg-secondary" />
          <Text className="text-center text-sm font-semibold text-secondary">
            عادةً تستغرق المراجعة من 24 إلى 48 ساعة. لو عندك أي استفسار، تقدر تتواصل معانا من خلال
            الدعم الفني.
          </Text>
        </View>
      </View>
      <View className="w-full border-t border-border/70 pt-4">
        <Button
          className="min-h-14 w-full rounded-2xl"
          size="lg"
          onPress={() => router.replace(route('/onboarding/permissions'))}>
          <Text className="font-bold text-primary-foreground">متابعة إعداد التطبيق</Text>
        </Button>
      </View>
    </OnboardingLayout>
  );
}

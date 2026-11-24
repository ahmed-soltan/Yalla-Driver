import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/hooks/auth-store';
import { ScreenHeader, ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';

export default function EarningsRoute() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') return <Redirect href="/" />;

  return (
    <ScreenLayout back={false}>
      <ScreenHeader title="الأرباح" subtitle="تابع أرباحك ومستحقاتك." back={false} />
      <Text className="w-full text-right text-muted-foreground">
        لا توجد بيانات أرباح متاحة حاليًا.
      </Text>
    </ScreenLayout>
  );
}

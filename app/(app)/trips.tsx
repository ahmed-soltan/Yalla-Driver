import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/hooks/auth-store';
import { ScreenHeader, ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';

export default function TripsRoute() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') return <Redirect href="/" />;

  return (
    <ScreenLayout back={false}>
      <ScreenHeader title="الرحلات" subtitle="ستظهر رحلاتك هنا." back={false} />
      <Text className="w-full text-right text-muted-foreground">لا توجد رحلات متاحة حاليًا.</Text>
    </ScreenLayout>
  );
}

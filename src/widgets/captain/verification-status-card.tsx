import { AlertCircle, CheckCircle2, Clock3 } from 'lucide-react-native';
import { View } from 'react-native';

import type { CaptainVerification } from '@/entities/captain/model/captain-types';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const statusLabels: Record<string, string> = {
  PENDING: 'في انتظار المراجعة',
  UNDER_REVIEW: 'جاري مراجعة البيانات',
  VERIFIED: 'تم التحقق من الحساب',
  REJECTED: 'تحتاج إلى تحديث البيانات',
  SUSPENDED: 'الحساب موقوف مؤقتًا',
};

export function VerificationStatusCard({
  verification,
  onPress,
}: {
  verification: CaptainVerification;
  onPress?: () => void;
}) {
  const verified = verification.status === 'VERIFIED' && verification.canGoOnline;
  const rejected = verification.status === 'REJECTED' || verification.status === 'SUSPENDED';
  const Icon = verified ? CheckCircle2 : rejected ? AlertCircle : Clock3;
  const color = verified ? '#15803D' : rejected ? '#DC2626' : '#B7791F';

  return (
    <View className="mb-4 w-full rounded-3xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5">
      <View className="flex-row-reverse  items-start gap-3">
        <View className="size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Icon size={24} color={color} />
        </View>
        <View className="flex-1 items-end">
          <Text className="w-full text-right text-lg font-bold">
            {verified ? 'حسابك جاهز لاستقبال الرحلات' : 'حسابك قيد التحقق'}
          </Text>
          <Text className="mt-1 w-full text-right text-sm text-muted-foreground">
            {statusLabels[verification.status]}
          </Text>
        </View>
      </View>
      {!verified && (
        <>
          <Text className="mt-4 text-right text-sm leading-6 text-muted-foreground">
            لا يمكنك استقبال الرحلات حتى يتم التحقق من بياناتك ومستنداتك والمركبة.
          </Text>
          <Button className="mt-4 min-h-12 rounded-2xl" variant="secondary" onPress={onPress}>
            <Text className="font-bold text-secondary-foreground">عرض تفاصيل التحقق</Text>
          </Button>
        </>
      )}
    </View>
  );
}

// src/features/active-order/ui/finished-view.tsx
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney } from '@/shared/lib/format-money';
import { homeHref } from '@/shared/lib/routes';
import type { ActiveOrder } from '@/entities/order/model/active-order-types';

const CANCELLED_BY: Record<string, string> = {
  CUSTOMER: 'العميل لغى الطلب.',
  CAPTAIN: 'أنت لغيت الطلب.',
  SYSTEM: 'الطلب اتلغى.',
};

export function FinishedView({ order }: { order: ActiveOrder }) {
  const insets = useSafeAreaInsets();
  const done = order.status === 'COMPLETED';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BRAND.background,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
      }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {done ? (
          <CircleCheck size={64} color={BRAND.teal} />
        ) : (
          <CircleX size={64} color={BRAND.danger} />
        )}
        <Text style={{ color: BRAND.text, fontSize: 24, fontWeight: '700' }}>
          {done ? 'تم بنجاح' : 'الطلب اتلغى'}
        </Text>
        {done ? (
          <>
            <Text style={{ color: BRAND.muted, fontSize: 14 }}>ربحك من الطلب</Text>
            <Text style={{ color: BRAND.text, fontSize: 36, fontWeight: '700' }}>
              {formatMoney(order.pricing.captainNetPiastres)}
            </Text>
          </>
        ) : (
          <Text style={{ color: BRAND.muted, fontSize: 15, textAlign: 'center' }}>
            {CANCELLED_BY[order.cancelledBy ?? 'SYSTEM']}
          </Text>
        )}
        <Text style={{ color: BRAND.muted, fontSize: 13 }}>{order.orderNumber}</Text>
      </View>

      <Pressable
        onPress={() => router.replace(homeHref)}
        accessibilityRole="button"
        accessibilityLabel="رجوع للرئيسية"
        style={{
          height: 56,
          borderRadius: 14,
          backgroundColor: BRAND.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: BRAND.onPrimary, fontSize: 18, fontWeight: '700' }}>
          رجوع للرئيسية
        </Text>
      </Pressable>
    </View>
  );
}

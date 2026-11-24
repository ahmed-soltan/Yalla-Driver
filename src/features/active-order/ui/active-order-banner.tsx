// src/features/active-order/ui/active-order-banner.tsx
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { activeOrderHref } from '@/shared/lib/routes';
import { useCurrentOrder } from '../service/use-active-order';

const LABEL = { RIDE: 'مشوار', STORE_DELIVERY: 'توصيل من محل', PARCEL: 'شحنة' } as const;

/** Shown on Home while the captain has an unfinished order. */
export function ActiveOrderBanner() {
  const insets = useSafeAreaInsets();
  const { data: order } = useCurrentOrder();
  if (!order) return null;

  return (
    <Pressable
      onPress={() => router.push(activeOrderHref(order.orderId))}
      accessibilityRole="button"
      accessibilityLabel={`رجوع للطلب الحالي، ${LABEL[order.serviceType]}`}
      style={{
        position: 'absolute',
        top: insets.top + 12,
        start: 16,
        end: 76, // leaves room for the recenter button
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: BRAND.dark,
        paddingHorizontal: 14,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
      }}>
      <Text style={{ color: BRAND.onPrimary, fontSize: 14, fontWeight: '700', flex: 1 }}>
        رجوع للطلب الحالي · {LABEL[order.serviceType]}
      </Text>
      <ChevronLeft size={20} color={BRAND.onPrimary} />
    </Pressable>
  );
}

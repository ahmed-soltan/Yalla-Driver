// src/screens/active-order/active-order-screen.tsx
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney } from '@/shared/lib/format-money';
import { getContact, getStep } from '@/features/active-order/model/order-steps';
import { OrderMap } from '@/features/active-order/ui/order-map';
import { TargetRow } from '@/features/active-order/ui/target-row';
import { ServiceDetails } from '@/features/active-order/ui/service-details';
import { ReceiptCard } from '@/features/active-order/ui/receipt-card';
import { CancelSheet } from '@/features/active-order/ui/cancel-sheet';
import { FinishedView } from '@/features/active-order/ui/finished-view';
import { useActiveOrder } from '@/features/active-order/service/use-active-order';
import { chatHref } from '@/shared/lib/routes';

export function ActiveOrderScreen({ orderId }: { orderId: string }) {
  const insets = useSafeAreaInsets();
  const { query, arrived, start, complete, cancel, receipt, busy, failed } =
    useActiveOrder(orderId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const order = query.data;

  if (query.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.background,
        }}>
        <ActivityIndicator color={BRAND.primary} />
      </View>
    );
  }

  if (query.isError || !order) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          backgroundColor: BRAND.background,
        }}>
        <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
          ما قدرناش نحمّل الطلب
        </Text>
        <Pressable
          onPress={() => query.refetch()}
          accessibilityRole="button"
          accessibilityLabel="أعد المحاولة"
          style={{
            height: 50,
            paddingHorizontal: 28,
            borderRadius: 12,
            backgroundColor: BRAND.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: BRAND.onPrimary, fontSize: 16, fontWeight: '700' }}>
            أعد المحاولة
          </Text>
        </Pressable>
      </View>
    );
  }

  const step = getStep(order);
  if (!step) return <FinishedView order={order} />;

  const contact = getContact(order);
  const place = step.target === 'pickup' ? order.pickup : order.destination;
  const { cashToCollectPiastres: cash, collectAt, captainNetPiastres } = order.pricing;
  const needsReceipt =
    order.serviceType === 'STORE_DELIVERY' && step.action === 'start' && !order.receipt;

  // Cash is confirmed at the phase the backend says it is collected.
  const withCashCheck = (phase: 'PICKUP' | 'DELIVERY', go: (collected?: number) => void) => {
    if (collectAt === phase && cash != null && cash > 0) {
      Alert.alert('استلمت الكاش؟', `لازم تستلم ${formatMoney(cash)} كاش.`, [
        { text: 'لسه', style: 'cancel' },
        { text: 'استلمت', onPress: () => go(cash) },
      ]);
    } else {
      go();
    }
  };

  const onPrimary = () => {
    if (step.action === 'arrived') arrived.mutate();
    else if (step.action === 'start') withCashCheck('PICKUP', (c) => start.mutate(c));
    else withCashCheck('DELIVERY', (c) => complete.mutate(c));
  };

  const cashLine =
    cash != null && cash > 0
      ? `هتحصّل ${formatMoney(cash)} كاش ${collectAt === 'PICKUP' ? 'عند الاستلام' : 'عند التسليم'}`
      : order.serviceType === 'STORE_DELIVERY' && cash == null
        ? 'هتحصّل تمن الطلبات + أجرة التوصيل كاش بعد ما ترفع الفاتورة'
        : null;

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background }}>
      <OrderMap pickup={order.pickup} destination={order.destination} />

      <View
        style={{
          backgroundColor: BRAND.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderColor: BRAND.line,
          maxHeight: '64%',
        }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                accessibilityRole="header"
                style={{ color: BRAND.text, fontSize: 22, fontWeight: '700' }}>
                {step.title}
              </Text>
              <Text style={{ color: BRAND.muted, fontSize: 14 }}>{step.hint}</Text>
            </View>
            <Text style={{ color: BRAND.muted, fontSize: 12 }}>{order.orderNumber}</Text>
          </View>

          <TargetRow
            targetLabel={step.targetLabel}
            place={place}
            contact={contact}
            onChat={() => router.push(chatHref(orderId))}
          />

          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: BRAND.line,
              paddingVertical: 12,
              gap: 4,
            }}>
            <Text style={{ color: BRAND.text, fontSize: 15 }}>
              ربحك من الطلب:{' '}
              <Text style={{ fontWeight: '700' }}>{formatMoney(captainNetPiastres)}</Text>
            </Text>
            {cashLine ? <Text style={{ color: BRAND.muted, fontSize: 14 }}>{cashLine}</Text> : null}
          </View>

          <ServiceDetails order={order} />

          {order.serviceType === 'STORE_DELIVERY' && order.status === 'ARRIVED' ? (
            <ReceiptCard
              receipt={order.receipt}
              busy={receipt.isPending}
              failed={receipt.isError}
              onSubmit={(input) => receipt.mutate(input)}
            />
          ) : null}

          {failed ? (
            <Text style={{ color: BRAND.danger, fontSize: 14 }}>
              ما قدرناش نحدّث الطلب. اتأكد من النت وجرب تاني.
            </Text>
          ) : null}

          <Pressable
            onPress={() => setCancelOpen(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="إلغاء الطلب"
            style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: BRAND.danger, fontSize: 14, fontWeight: '700' }}>
              إلغاء الطلب
            </Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: 20, paddingTop: 8, paddingBottom: insets.bottom + 16 }}>
          {needsReceipt ? (
            <Text
              style={{ color: BRAND.muted, fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
              ارفع فاتورة المحل الأول عشان تبدأ التوصيل.
            </Text>
          ) : null}
          <Pressable
            onPress={onPrimary}
            disabled={busy || needsReceipt}
            accessibilityRole="button"
            accessibilityLabel={step.actionLabel}
            accessibilityState={{ disabled: busy || needsReceipt, busy }}
            style={{
              height: 58,
              borderRadius: 14,
              backgroundColor: BRAND.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: needsReceipt ? 0.4 : 1,
            }}>
            {arrived.isPending || start.isPending || complete.isPending ? (
              <ActivityIndicator color={BRAND.onPrimary} />
            ) : (
              <Text style={{ color: BRAND.onPrimary, fontSize: 18, fontWeight: '700' }}>
                {step.actionLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <CancelSheet
        visible={cancelOpen}
        busy={cancel.isPending}
        failed={cancel.isError}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => cancel.mutate(reason, { onSuccess: () => setCancelOpen(false) })}
      />
    </View>
  );
}

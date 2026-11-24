// src/features/active-order/ui/service-details.tsx
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney, formatNumber } from '@/shared/lib/format-money';
import type { ActiveOrder } from '@/entities/order/model/active-order-types';

const PACKAGE_TYPE: Record<string, string> = { DOCUMENTS: 'مستندات' };
const PACKAGE_SIZE: Record<string, string> = { SMALL: 'صغير', MEDIUM: 'متوسط', LARGE: 'كبير' };

function Box({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: BRAND.surface, borderRadius: 12, padding: 12, gap: 6 }}>
      {children}
    </View>
  );
}

function Line({ text }: { text: string }) {
  return <Text style={{ color: BRAND.text, fontSize: 14 }}>{text}</Text>;
}

export function ServiceDetails({ order }: { order: ActiveOrder }) {
  const [checked, setChecked] = useState<number[]>([]);

  switch (order.serviceType) {
    case 'RIDE':
      return order.details.passengerNote ? (
        <Box>
          <Line text={`"${order.details.passengerNote}"`} />
        </Box>
      ) : null;

    case 'PARCEL': {
      const d = order.details;
      const lines = [
        [
          PACKAGE_TYPE[d.packageType] ?? 'طرد',
          PACKAGE_SIZE[d.packageSize],
          d.isFragile ? 'قابل للكسر' : '',
        ]
          .filter(Boolean)
          .join(' · '),
        d.description ?? '',
        d.declaredValuePiastres > 0
          ? `قيمة الشحنة المُعلنة ${formatMoney(d.declaredValuePiastres)}`
          : '',
        d.deliveryNotes ?? '',
      ].filter(Boolean);
      return (
        <Box>
          {lines.map((l) => (
            <Line key={l} text={l} />
          ))}
        </Box>
      );
    }

    case 'STORE_DELIVERY': {
      const buying = order.status === 'ACCEPTED' || order.status === 'ARRIVED';
      return (
        <Box>
          {order.details.items.map((item, i) => {
            const done = checked.includes(i);
            return (
              <Pressable
                key={`${item.name}-${i}`}
                disabled={!buying}
                onPress={() =>
                  setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done, disabled: !buying }}
                accessibilityLabel={`${item.name} × ${formatNumber(item.quantity)}`}
                style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 44,
                }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: done ? BRAND.teal : BRAND.line,
                    backgroundColor: done ? BRAND.teal : BRAND.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {done ? <Check size={16} color={BRAND.onPrimary} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>
                    {item.name} × {formatNumber(item.quantity)} {item.unit}
                  </Text>
                  {item.details ? (
                    <Text style={{ color: BRAND.muted, fontSize: 13 }}>{item.details}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
          {order.details.customerInstructions ? (
            <Line text={`ملحوظة العميل: ${order.details.customerInstructions}`} />
          ) : null}
        </Box>
      );
    }
  }
}

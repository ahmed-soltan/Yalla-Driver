// src/features/trips/ui/trip-filter.tsx
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { OrderHistoryFilter } from '@/entities/order/model/order-types';

const OPTIONS: { value: OrderHistoryFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'COMPLETED', label: 'مكتملة' },
  { value: 'CANCELLED', label: 'ملغية' },
];

export function TripFilter({
  value,
  onChange,
}: {
  value: OrderHistoryFilter;
  onChange: (v: OrderHistoryFilter) => void;
}) {
  return (
    <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
      {OPTIONS.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            style={{
              minHeight: 44,
              paddingHorizontal: 18,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? BRAND.dark : BRAND.background,
              borderWidth: 1,
              borderColor: selected ? BRAND.dark : BRAND.line,
            }}>
            <Text
              style={{
                color: selected ? BRAND.onPrimary : BRAND.text,
                fontSize: 14,
                fontWeight: '700',
              }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

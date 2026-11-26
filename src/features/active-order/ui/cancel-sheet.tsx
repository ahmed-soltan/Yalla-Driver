// src/features/active-order/ui/cancel-sheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { CancelReason } from '@/entities/order/model/active-order-types';

const REASONS: { value: CancelReason; label: string }[] = [
  { value: 'CUSTOMER_NOT_RESPONDING', label: 'العميل مش بيرد' },
  { value: 'CUSTOMER_REQUESTED', label: 'العميل طلب يلغي' },
  { value: 'VEHICLE_PROBLEM', label: 'مشكلة في المركبة' },
  { value: 'OTHER', label: 'سبب تاني' },
];

type Props = {
  visible: boolean;
  busy: boolean;
  failed: boolean;
  onClose: () => void;
  onConfirm: (reason: CancelReason) => void;
};

export function CancelSheet({ visible, busy, failed, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<CancelReason | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={busy ? undefined : onClose}
        accessibilityLabel="إغلاق"
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: BRAND.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: insets.bottom + 20,
            gap: 12,
          }}>
          <Text style={{ color: BRAND.text, fontSize: 18, fontWeight: '700', lineHeight: 28 }}>
            ليه عايز تلغي الطلب؟
          </Text>

          {REASONS.map((r) => {
            const selected = reason === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => setReason(r.value)}
                disabled={busy}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={r.label}
                style={{
                  minHeight: 52,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? BRAND.dark : BRAND.line,
                  backgroundColor: selected ? BRAND.surface : BRAND.background,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{ color: BRAND.text, fontSize: 15, fontWeight: selected ? '700' : '500' }}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}

          {failed ? (
            <Text style={{ color: BRAND.danger, fontSize: 14 }}>
              ما قدرناش نلغي الطلب. جرب تاني.
            </Text>
          ) : null}

          <Pressable
            onPress={() => reason && onConfirm(reason)}
            disabled={!reason || busy}
            accessibilityRole="button"
            accessibilityLabel="تأكيد الإلغاء"
            accessibilityState={{ disabled: !reason || busy, busy }}
            style={{
              height: 54,
              borderRadius: 14,
              backgroundColor: BRAND.danger,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              opacity: !reason || busy ? 0.4 : 1,
            }}>
            {busy ? (
              <ActivityIndicator color={BRAND.onPrimary} />
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  color: BRAND.onPrimary,
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                تأكيد الإلغاء
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={onClose}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>رجوع</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

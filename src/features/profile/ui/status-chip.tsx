// src/features/profile/ui/status-chip.tsx
import { View } from 'react-native';
import { Ban, CircleAlert, CircleCheck, Clock, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';

export type AnyStatus =
  'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'MISSING' | 'EXPIRED' | 'SUSPENDED';

const CONFIG: Record<AnyStatus, { label: string; Icon: LucideIcon; color: string; bg: string }> = {
  VERIFIED: { label: 'موثّق', Icon: CircleCheck, color: BRAND.success, bg: BRAND.successBg },
  UNDER_REVIEW: { label: 'قيد المراجعة', Icon: Clock, color: BRAND.muted, bg: BRAND.surface },
  PENDING: { label: 'في الانتظار', Icon: Clock, color: BRAND.muted, bg: BRAND.surface },
  REJECTED: { label: 'مرفوض', Icon: CircleAlert, color: BRAND.danger, bg: BRAND.surface },
  MISSING: { label: 'ناقص', Icon: CircleAlert, color: BRAND.danger, bg: BRAND.surface },
  EXPIRED: { label: 'منتهي', Icon: CircleAlert, color: BRAND.danger, bg: BRAND.surface },
  SUSPENDED: { label: 'موقوف', Icon: Ban, color: BRAND.danger, bg: BRAND.surface },
};

/** Icon + text, never color alone. */
export function StatusChip({ status }: { status: AnyStatus }) {
  const { label, Icon, color, bg } = CONFIG[status];
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: bg,
      }}>
      <Icon size={14} color={color} />
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

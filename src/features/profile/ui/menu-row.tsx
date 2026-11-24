// src/features/profile/ui/menu-row.tsx
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';

type Props = {
  Icon: LucideIcon;
  label: string;
  trailing?: ReactNode;
  danger?: boolean;
  chevron?: boolean;
  onPress: () => void;
};

export function MenuRow({ Icon, label, trailing, danger, chevron = true, onPress }: Props) {
  const color = danger ? BRAND.danger : BRAND.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        minHeight: 60,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: BRAND.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon size={20} color={color} />
      </View>
      <Text style={{ flex: 1, color, fontSize: 16, fontWeight: '700' }}>{label}</Text>
      {trailing}
      {chevron ? <ChevronLeft size={20} color={BRAND.muted} /> : null}
    </Pressable>
  );
}

export function MenuCard({ children }: { children: ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  return (
    <View
      style={{
        backgroundColor: BRAND.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BRAND.line,
        overflow: 'hidden',
      }}>
      {items.map((child, i) => (
        <View key={i}>
          {i > 0 ? (
            <View style={{ height: 1, backgroundColor: BRAND.line, marginStart: 68 }} />
          ) : null}
          {child}
        </View>
      ))}
    </View>
  );
}

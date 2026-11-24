// src/features/home/ui/demand-chip.tsx
import { View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';

/** "Where it is busy" hint floating on the map while the captain waits for offers. */
export function DemandChip({ text }: { text: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={{
        position: 'absolute',
        top: insets.top + 12,
        start: 16,
        maxWidth: '70%',
        minHeight: 44,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        borderRadius: 22,
        backgroundColor: BRAND.onPrimary,
        borderWidth: 1,
        borderColor: BRAND.line,
      }}>
      <TrendingUp size={18} color={BRAND.teal} />
      <Text
        numberOfLines={1}
        style={{ color: BRAND.text, fontSize: 14, fontWeight: '700', flexShrink: 1 }}>
        {text}
      </Text>
    </View>
  );
}

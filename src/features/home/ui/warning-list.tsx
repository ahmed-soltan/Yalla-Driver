// src/features/home/ui/warning-list.tsx
import { Pressable, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { SheetBlocker } from './home-sheet';

/** Documents that are still valid but close to expiry. Not blockers. */
export function WarningList({ warnings }: { warnings: SheetBlocker[] }) {
  return (
    <>
      {warnings.map((w) => (
        <View
          key={w.key}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 10,
            backgroundColor: BRAND.primarySoft,
            borderRadius: 12,
            padding: 12,
          }}>
          <Clock size={22} color={BRAND.primary} />
          <Text style={{ color: BRAND.text, fontSize: 14, flex: 1 }}>{w.message}</Text>
          {w.onFix && w.fixLabel ? (
            <Pressable
              onPress={w.onFix}
              accessibilityRole="button"
              accessibilityLabel={w.fixLabel}
              style={{
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: BRAND.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: BRAND.onPrimary, fontSize: 14, fontWeight: '700' }}>
                {w.fixLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </>
  );
}

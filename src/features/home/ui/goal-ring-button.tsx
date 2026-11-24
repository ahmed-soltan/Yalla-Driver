// src/features/home/ui/goal-ring-button.tsx
import { ActivityIndicator, Pressable, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { RING_SIZE, RING_STROKE } from '../constants/home-constants';

const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const INNER = RING_SIZE - 28;

type Props = {
  progress: number; // 0..1, earnings toward the daily goal
  online: boolean;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function GoalRingButton({ progress, online, busy, disabled, onPress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const label = online ? 'وقف' : 'ابدأ';

  return (
    <View
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        backgroundColor: BRAND.background,
        borderWidth: 1,
        borderColor: BRAND.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
        <G rotation={-90} origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={BRAND.line}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={BRAND.teal}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE * clamped} ${CIRCUMFERENCE}`}
          />
        </G>
      </Svg>

      <Pressable
        onPress={onPress}
        disabled={disabled || busy}
        accessibilityRole="button"
        accessibilityLabel={online ? 'إيقاف استقبال الطلبات' : 'ابدأ استقبال الطلبات'}
        accessibilityState={{ disabled: disabled || busy, busy }}
        style={{
          width: INNER,
          height: INNER,
          borderRadius: INNER / 2,
          backgroundColor: online ? BRAND.dark : BRAND.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        }}>
        {busy ? (
          <ActivityIndicator color={BRAND.onPrimary} />
        ) : (
          <Text style={{ color: BRAND.onPrimary, fontSize: 22, fontWeight: '700', lineHeight: 28 }}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

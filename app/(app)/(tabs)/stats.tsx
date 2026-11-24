// app/(app)/(tabs)/stats.tsx  (placeholder: replace in its phase)
import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';

export default function StatsRoute() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND.background,
      }}>
      <Text style={{ color: BRAND.text, fontSize: 20, fontWeight: '700' }}>الإحصائيات</Text>
    </View>
  );
}

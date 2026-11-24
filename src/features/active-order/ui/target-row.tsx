// src/features/active-order/ui/target-row.tsx
import { Linking, Pressable, View } from 'react-native';
import { MessageCircle, Navigation2, Phone, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { OrderPlace } from '@/entities/offer/model/offer-types';

function RoundAction({
  Icon,
  label,
  color,
  background,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon size={22} color={color} />
    </Pressable>
  );
}

export function TargetRow({
  targetLabel,
  place,
  contact,
  onChat,
}: {
  targetLabel: string;
  place: OrderPlace;
  contact: { phone: string; role: string } | null;
  onChat?: () => void;
}) {
  const navigate = () => {
    const { lat, lng } = place.location;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    ).catch(() => {});
  };

  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: BRAND.muted, fontSize: 12 }}>{targetLabel}</Text>
        <Text numberOfLines={2} style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>
          {place.label}
        </Text>
      </View>
      {onChat ? (
        <RoundAction
          Icon={MessageCircle}
          label="افتح المحادثة"
          color={BRAND.dark}
          background={BRAND.surface}
          onPress={onChat}
        />
      ) : null}
      {contact ? (
        <RoundAction
          Icon={Phone}
          label={`اتصل بـ${contact.role}`}
          color={BRAND.dark}
          background={BRAND.surface}
          onPress={() => Linking.openURL(`tel:${contact.phone}`).catch(() => {})}
        />
      ) : null}
      <RoundAction
        Icon={Navigation2}
        label="افتح الاتجاهات"
        color={BRAND.onPrimary}
        background={BRAND.teal}
        onPress={navigate}
      />
    </View>
  );
}

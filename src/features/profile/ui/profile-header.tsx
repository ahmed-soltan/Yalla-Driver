// src/features/profile/ui/profile-header.tsx
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatNumber, formatRating } from '@/shared/lib/format-money';
import type { CaptainProfile } from '@/entities/captain/model/captain-types';
import { StatusChip } from './status-chip';

export function ProfileHeader({ profile }: { profile: CaptainProfile }) {
  const { user } = profile;
  const initial = user.fullName.trim().charAt(0);

  return (
    <View
      style={{
        backgroundColor: BRAND.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BRAND.line,
        padding: 16,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 14,
      }}>
      {user.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          contentFit="cover"
          accessibilityLabel="صورتك الشخصية"
          style={{ width: 72, height: 72, borderRadius: 36 }}
        />
      ) : (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: BRAND.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: BRAND.onPrimary, fontSize: 30, fontWeight: '700' }}>{initial}</Text>
        </View>
      )}

      <View style={{ flex: 1, gap: 4 }}>
        <Text numberOfLines={1} style={{ color: BRAND.text, fontSize: 20, fontWeight: '700' }}>
          {user.fullName}
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: 14 }}>{user.phoneNumber}</Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
            <Star size={14} color={BRAND.primary} fill={BRAND.primary} />
            <Text style={{ color: BRAND.text, fontSize: 13, fontWeight: '700' }}>
              {profile.rating > 0 ? formatRating(profile.rating) : '—'}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 13 }}>
              · {formatNumber(profile.tripsCount)} رحلة
            </Text>
          </View>
          <StatusChip status={profile.verificationStatus} />
        </View>
      </View>
    </View>
  );
}

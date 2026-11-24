// src/features/trips/ui/trip-card.tsx
import { View } from 'react-native';
import { Car, Package, Star, Store, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney, formatNumber, formatRating } from '@/shared/lib/format-money';
import { formatDateTime } from '@/shared/lib/format-date';
import type { OrderHistoryItem, ServiceType } from '@/entities/order/model/order-types';

const SERVICE: Record<ServiceType, { label: string; Icon: LucideIcon }> = {
  RIDE: { label: 'مشوار', Icon: Car },
  STORE_DELIVERY: { label: 'توصيل من محل', Icon: Store },
  PARCEL: { label: 'شحنة', Icon: Package },
};

const VEHICLE: Record<string, string> = { CAR: 'سيارة', MOTORCYCLE: 'موتوسيكل' };
const PACKAGE_TYPE: Record<string, string> = { DOCUMENTS: 'مستندات' };
const PACKAGE_SIZE: Record<string, string> = { SMALL: 'صغير', MEDIUM: 'متوسط', LARGE: 'كبير' };

/** The one line that differs per service type. */
function detailLine(item: OrderHistoryItem): string {
  switch (item.serviceType) {
    case 'RIDE':
      return VEHICLE[item.vehicleType] ?? item.vehicleType;
    case 'STORE_DELIVERY':
      return `${item.storeName} · ${formatNumber(item.itemsCount)} أصناف`;
    case 'PARCEL':
      return [
        PACKAGE_TYPE[item.packageType] ?? 'طرد',
        PACKAGE_SIZE[item.packageSize],
        item.isFragile ? 'قابل للكسر' : null,
      ]
        .filter(Boolean)
        .join(' · ');
  }
}

export function TripCard({ item }: { item: OrderHistoryItem }) {
  const { label, Icon } = SERVICE[item.serviceType];
  const cancelled = item.status === 'CANCELLED';
  const detail = detailLine(item);

  return (
    <View
      accessible
      accessibilityLabel={`${label}، ${cancelled ? 'ملغية' : 'مكتملة'}، من ${item.pickup.label} إلى ${item.destination.label}`}
      style={{
        backgroundColor: BRAND.background,
        borderWidth: 1,
        borderColor: BRAND.line,
        borderRadius: 16,
        padding: 16,
        gap: 14,
      }}>
      {/* Service + status */}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
        <Icon size={20} color={BRAND.dark} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>{label}</Text>
          {detail ? (
            <Text numberOfLines={1} style={{ color: BRAND.muted, fontSize: 12 }}>
              {detail}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: cancelled ? BRAND.surface : BRAND.successBg,
          }}>
          <Text
            style={{
              color: cancelled ? BRAND.danger : BRAND.success,
              fontSize: 12,
              fontWeight: '700',
            }}>
            {cancelled ? 'ملغية' : 'مكتملة'}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
        <View style={{ alignItems: 'center', paddingVertical: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.teal }} />
          <View style={{ flex: 1, width: 2, backgroundColor: BRAND.line, marginVertical: 3 }} />
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.primary }}
          />
        </View>
        <View style={{ flex: 1, gap: 14 }}>
          <Text numberOfLines={1} style={{ color: BRAND.text, fontSize: 14 }}>
            {item.pickup.label}
          </Text>
          <Text numberOfLines={1} style={{ color: BRAND.text, fontSize: 14 }}>
            {item.destination.label}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderTopColor: BRAND.line,
          paddingTop: 12,
        }}>
        <View style={{ gap: 2 }}>
          <Text style={{ color: BRAND.muted, fontSize: 13 }}>
            {formatDateTime(item.completedAt ?? item.createdAt)}
          </Text>
          <Text style={{ color: BRAND.muted, fontSize: 12 }}>{item.orderNumber}</Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
          {item.ratingStars != null ? (
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
              <Star size={14} color={BRAND.primary} fill={BRAND.primary} />
              <Text style={{ color: BRAND.text, fontSize: 13, fontWeight: '700' }}>
                {formatRating(item.ratingStars)}
              </Text>
            </View>
          ) : null}
          {cancelled ? null : (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
                {formatMoney(item.captainNetPiastres)}
              </Text>
              <Text style={{ color: BRAND.muted, fontSize: 11 }}>صافي ربحك</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

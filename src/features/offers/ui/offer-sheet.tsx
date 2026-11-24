// src/features/offers/ui/offer-sheet.tsx
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { ReduceMotion, SlideInDown } from 'react-native-reanimated';
import { Car, Minus, Package, Plus, Store, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney, formatNumber } from '@/shared/lib/format-money';
import { formatClock, formatDistance, formatMinutes } from '@/shared/lib/format-trip';
import type { OrderOffer, QueuedOffer } from '@/entities/offer/model/offer-types';
import { useOfferStore } from '../model/offer-store';
import Toast from 'react-native-toast-message';
import { useOfferActions } from '../model/use-offer-actions';
import { OFFER_TIMEOUT_MS, OFFER_TIMEOUT_SECONDS } from '../constants/offer-constants';
import { useCountdown } from '../model/use-count-down';

const SERVICE: Record<OrderOffer['serviceType'], { label: string; Icon: LucideIcon }> = {
  RIDE: { label: 'مشوار', Icon: Car },
  STORE_DELIVERY: { label: 'توصيل من محل', Icon: Store },
  PARCEL: { label: 'شحنة', Icon: Package },
};
const VEHICLE: Record<string, string> = { CAR: 'سيارة', MOTORCYCLE: 'موتوسيكل' };
const PACKAGE_TYPE: Record<string, string> = { DOCUMENTS: 'مستندات' };
const PACKAGE_SIZE: Record<string, string> = { SMALL: 'صغير', MEDIUM: 'متوسط', LARGE: 'كبير' };

const COUNTER_STEP = 500; // 5 EGP
const COUNTER_LIFETIME_MS = 120000;

/** The lines that differ per service type. */
function detailLines(offer: OrderOffer): string[] {
  switch (offer.serviceType) {
    case 'RIDE': {
      const { vehicleType, passengerNote } = offer.details;
      return [
        VEHICLE[vehicleType] ?? vehicleType,
        passengerNote ? `"${passengerNote}"` : '',
      ].filter(Boolean);
    }
    case 'PARCEL': {
      const d = offer.details;
      return [
        [
          PACKAGE_TYPE[d.packageType] ?? 'طرد',
          PACKAGE_SIZE[d.packageSize],
          d.isFragile ? 'قابل للكسر' : '',
        ]
          .filter(Boolean)
          .join(' · '),
        d.description ?? '',
        `الدافع: ${d.paidBy === 'SENDER' ? 'المرسل' : 'المستلم'}`,
        d.declaredValuePiastres > 0
          ? `قيمة الشحنة المُعلنة ${formatMoney(d.declaredValuePiastres)}`
          : '',
        d.deliveryNotes ?? '',
      ].filter(Boolean);
    }
    case 'STORE_DELIVERY': {
      const d = offer.details;
      const shown = d.items.slice(0, 3).map((i) => `${i.name} × ${formatNumber(i.quantity)}`);
      const rest = d.items.length - shown.length;
      return [
        d.storeName,
        ...shown,
        rest > 0 ? `و ${formatNumber(rest)} أصناف تانية` : '',
        `تمن الطلبات التقريبي ${formatMoney(d.estimatedItemsAmountPiastres)} (هتدفعه للمحل وتاخده من العميل)`,
        d.customerInstructions ?? '',
      ].filter(Boolean);
    }
  }
}

function netFor(fare: number, basisPoints: number) {
  return fare - Math.round((fare * basisPoints) / 10000);
}

function Chip({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: BRAND.surface,
      }}>
      <Text style={{ color: BRAND.text, fontSize: 13, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

function RoundButton({
  Icon,
  label,
  disabled,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: BRAND.line,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}>
      <Icon size={22} color={BRAND.dark} />
    </Pressable>
  );
}

function PrimaryButton({
  label,
  busy,
  disabled,
  onPress,
}: {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={{
        height: 56,
        borderRadius: 14,
        backgroundColor: BRAND.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}>
      {busy ? (
        <ActivityIndicator color={BRAND.onPrimary} />
      ) : (
        <Text style={{ color: BRAND.onPrimary, fontSize: 18, fontWeight: '700' }}>{label}</Text>
      )}
    </Pressable>
  );
}

function OutlineButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BRAND.line,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}>
      <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function OfferSheet({ offer }: { offer: QueuedOffer }) {
  const insets = useSafeAreaInsets();
  const { accept, reject, counter } = useOfferActions();
  const pending = useOfferStore((s) => (s.counter?.orderId === offer.orderId ? s.counter : null));
  const remove = useOfferStore((s) => s.remove);

  const { pricing } = offer;
  const canCounter =
    pricing.canCounter &&
    pricing.minCounterFarePiastres != null &&
    pricing.maxCounterFarePiastres != null;
  const minFare = pricing.minCounterFarePiastres ?? pricing.farePiastres;
  const maxFare = pricing.maxCounterFarePiastres ?? pricing.farePiastres;

  const [counterMode, setCounterMode] = useState(false);
  const [counterFare, setCounterFare] = useState(() =>
    Math.min(maxFare, pricing.farePiastres + COUNTER_STEP)
  );

  // The captain has OFFER_TIMEOUT_MS from the moment the offer arrives, even if the server's
  // deadline is later. While waiting for the passenger the clock follows the counteroffer.
  const offerDeadline = Math.min(
    new Date(offer.expiresAt).getTime(),
    offer.receivedAt + OFFER_TIMEOUT_MS
  );
  const remaining = useCountdown(
    pending ? pending.expiresAt : new Date(offerDeadline).toISOString()
  );
  const totalMs = pending
    ? Math.max(1, new Date(pending.expiresAt).getTime() - pending.sentAt || COUNTER_LIFETIME_MS)
    : Math.max(1, offerDeadline - offer.receivedAt);
  const progress = Math.min(1, remaining / totalMs);

  // Time is up: tell the captain why the card vanished, then drop it
  // (the server also sends its own expiry event).
  useEffect(() => {
    if (remaining === 0) {
      Toast.show({
        type: 'info',
        text1: pending ? 'العميل مردش على عرضك' : 'فاتك الطلب',
        text2: 'هنوصلك طلب تاني قريب.',
      });
      remove(offer.orderId);
    }
  }, [remaining, pending, remove, offer.orderId]);

  const { label, Icon } = SERVICE[offer.serviceType];
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `طلب جديد، ${label}، صافي ربحك ${formatMoney(pricing.estimatedCaptainNetPiastres)}. عندك ${formatNumber(OFFER_TIMEOUT_SECONDS)} ثانية للرد`
    );
  }, [label, pricing.estimatedCaptainNetPiastres]);

  const busy = accept.isPending || reject.isPending || counter.isPending;
  const lines = detailLines(offer);
  const failed = accept.isError || counter.isError;

  return (
    <Animated.View
      entering={SlideInDown.duration(250).reduceMotion(ReduceMotion.System)}
      style={{
        position: 'absolute',
        start: 12,
        end: 12,
        bottom: insets.bottom + 12,
        backgroundColor: BRAND.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: BRAND.line,
        overflow: 'hidden',
      }}>
      {/* Countdown */}
      <View style={{ height: 5, backgroundColor: BRAND.line }}>
        <View
          style={{
            height: 5,
            width: `${progress * 100}%`,
            backgroundColor: pending ? BRAND.teal : progress < 0.25 ? BRAND.danger : BRAND.primary,
          }}
        />
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        {/* Seconds left (the progress bar above is the visual; screen readers hear the announcement once) */}
        {!pending ? (
          <Text
            importantForAccessibility="no"
            accessibilityElementsHidden
            style={{
              color: progress < 0.25 ? BRAND.danger : BRAND.muted,
              fontSize: 13,
              fontWeight: '700',
              textAlign: 'right',
            }}>
            {formatNumber(Math.ceil(remaining / 1000))} ثانية للرد
          </Text>
        ) : null}

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon size={22} color={BRAND.dark} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>{label}</Text>
            <Text style={{ color: BRAND.muted, fontSize: 12 }}>{offer.orderNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: BRAND.text, fontSize: 26, fontWeight: '700' }}>
              {formatMoney(pricing.estimatedCaptainNetPiastres)}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 12 }}>
              صافي ربحك · الأجرة {formatMoney(pricing.farePiastres)}
            </Text>
          </View>
        </View>

        {/* Distances */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip
            text={`بعيد عنك ${formatDistance(offer.pickupDistanceMeters)} · ${formatMinutes(offer.pickupEtaSeconds)}`}
          />
          <Chip
            text={`المشوار ${formatDistance(offer.tripDistanceMeters)} · ${formatMinutes(offer.tripDurationSeconds)}`}
          />
        </View>

        {/* Route */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', paddingVertical: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.teal }} />
            <View style={{ flex: 1, width: 2, backgroundColor: BRAND.line, marginVertical: 3 }} />
            <View
              style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.primary }}
            />
          </View>
          <View style={{ flex: 1, gap: 14 }}>
            <Text numberOfLines={1} style={{ color: BRAND.text, fontSize: 15 }}>
              {offer.pickup.label}
            </Text>
            <Text numberOfLines={1} style={{ color: BRAND.text, fontSize: 15 }}>
              {offer.destination.label}
            </Text>
          </View>
        </View>

        {/* Service-specific details */}
        {lines.length > 0 ? (
          <View style={{ backgroundColor: BRAND.surface, borderRadius: 12, padding: 12, gap: 4 }}>
            {lines.map((line) => (
              <Text key={line} style={{ color: BRAND.text, fontSize: 14 }}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {failed ? (
          <Text style={{ color: BRAND.danger, fontSize: 14 }}>
            ما قدرناش ننفّذ. اتأكد من النت وجرب تاني.
          </Text>
        ) : null}

        {/* Actions */}
        {pending ? (
          <View
            style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}
            accessibilityLiveRegion="polite">
            <ActivityIndicator color={BRAND.teal} />
            <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
              بنستنى رد الراكب على {formatMoney(pending.farePiastres)}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 14 }}>{formatClock(remaining)}</Text>
          </View>
        ) : counterMode ? (
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <RoundButton
                Icon={Plus}
                label="زوّد ٥ جنيه"
                disabled={busy || counterFare + COUNTER_STEP > maxFare}
                onPress={() => setCounterFare((f) => Math.min(maxFare, f + COUNTER_STEP))}
              />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: BRAND.text, fontSize: 28, fontWeight: '700' }}>
                  {formatMoney(counterFare)}
                </Text>
                <Text style={{ color: BRAND.muted, fontSize: 13 }}>
                  صافي ربحك تقريبًا{' '}
                  {formatMoney(netFor(counterFare, pricing.commissionRateBasisPoints))}
                </Text>
              </View>
              <RoundButton
                Icon={Minus}
                label="قلّل ٥ جنيه"
                disabled={busy || counterFare - COUNTER_STEP < minFare}
                onPress={() => setCounterFare((f) => Math.max(minFare, f - COUNTER_STEP))}
              />
            </View>
            <PrimaryButton
              label="ابعت العرض"
              busy={counter.isPending}
              disabled={busy}
              onPress={() => counter.mutate({ orderId: offer.orderId, farePiastres: counterFare })}
            />
            <View style={{ flexDirection: 'row' }}>
              <OutlineButton label="رجوع" disabled={busy} onPress={() => setCounterMode(false)} />
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <PrimaryButton
              label="اقبل الطلب"
              busy={accept.isPending}
              disabled={busy}
              onPress={() => accept.mutate(offer.orderId)}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <OutlineButton
                label="ارفض"
                disabled={busy}
                onPress={() => reject.mutate({ orderId: offer.orderId })}
              />
              {canCounter ? (
                <OutlineButton
                  label="اطلب سعر تاني"
                  disabled={busy}
                  onPress={() => setCounterMode(true)}
                />
              ) : null}
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

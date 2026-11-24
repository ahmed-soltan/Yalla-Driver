// src/screens/home/home-screen.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocateFixed, Navigation } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { useCaptainHome, useSetAvailability } from '@/features/home/services/use-captain-home';
import { useLocationPermission } from '@/features/home/services/use-location-permission';
import { useOfferStore } from '@/features/offers/model/offer-store';
import { ActiveOrderBanner } from '@/features/active-order/ui/active-order-banner';
import { OfferOverlay } from '@/features/offers/ui/offer-overlay';
import { GoalRingButton } from '@/features/home/ui/goal-ring-button';
import { HomeSheet, type SheetBlocker } from '@/features/home/ui/home-sheet';
import { OnlineSheet } from '@/features/home/ui/online-sheet';
import { DemandChip } from '@/features/home/ui/demand-chip';
import {
  DOCUMENTS_ROUTE,
  RING_SIZE,
  SHEBIN_EL_KOM,
  TAB_BAR_CLEARANCE,
} from '@/features/home/constants/home-constants';
import { useCurrentOrder } from '@/features/active-order/service/use-active-order';
import { useLocationStore } from '@/features/home/model/use-location-store';
import { BRAND_MAP_STYLE } from '@/shared/config/map-style';

function CaptainMarker() {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: BRAND.teal,
          borderWidth: 3,
          borderColor: BRAND.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Navigation size={16} color={BRAND.onPrimary} />
      </View>
      <View
        style={{
          marginTop: 2,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
          backgroundColor: BRAND.background,
          borderWidth: 1,
          borderColor: BRAND.line,
        }}>
        <Text style={{ color: BRAND.text, fontSize: 11, fontWeight: '700' }}>أنت</Text>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const home = useCaptainHome();
  const availability = useSetAvailability();
  const permission = useLocationPermission();

  const summary = home.summary;
  const online = home.isOnline;
  const hasOffer = useOfferStore((s) => s.queue.length > 0);
  const { data: currentOrder } = useCurrentOrder();

  // Written by the app-level location bridge (it keeps running when Home unmounts)
  const position = useLocationStore((s) => s.position);
  const backgroundActive = useLocationStore((s) => s.backgroundActive);

  // Native handle kept in state (no useRef in components)
  const [map, setMap] = useState<MapView | null>(null);
  const [centered, setCentered] = useState(false);

  const recenter = useCallback(() => {
    if (!map || !position) return;
    map.animateToRegion({ ...position, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
  }, [map, position]);

  // Center once, when the first fix arrives
  useEffect(() => {
    if (map && position && !centered) {
      // eslint-disable-next-line
      setCentered(true);
      recenter();
    }
  }, [map, position, centered, recenter]);

  // Backend blockers + the one only the phone knows about (location permission)
  const blockers: SheetBlocker[] = useMemo(() => {
    const list: SheetBlocker[] = [];
    if (permission.checked && !permission.granted) {
      list.push({
        key: 'LOCATION',
        message: 'محتاجين موقعك عشان نوصلك الطلبات القريبة منك.',
        fixLabel: 'فعّل الموقع',
        onFix: permission.fix,
      });
    }
    for (const b of home.blockers) {
      list.push({
        key: b.key,
        message: b.message,
        fixLabel: b.fixLabel,
        onFix: b.fixRoute ? () => router.push(b.fixRoute as Href) : undefined,
      });
    }
    return list;
  }, [permission.checked, permission.granted, permission.fix, home.blockers]);

  const warnings: SheetBlocker[] = useMemo(
    () =>
      home.warnings.map((w) => ({
        key: w.key,
        message: w.message,
        fixLabel: 'جدّد',
        onFix: () => router.push(`${DOCUMENTS_ROUTE}/${w.documentType}` as Href),
      })),
    [home.warnings]
  );

  const toggleOnline = useCallback(() => {
    availability.mutate(!online);
  }, [availability, online]);

  const progress = summary
    ? summary.today.goalPiastres > 0
      ? summary.today.earningsPiastres / summary.today.goalPiastres
      : 0
    : 0;

  // Going offline is always allowed. Going online needs no blockers.
  const cannotToggle = !online && blockers.length > 0;

  // Online and waiting: a slim bar (drag up for stats). Offline: the full sheet. Offer: neither.
  const showOnlineSheet = online && !!summary && !hasOffer;

  const actionError = availability.isError
    ? online
      ? 'ما قدرناش نوقف الاستقبال. اتأكد من النت وجرب تاني.'
      : 'ما قدرناش نبدأ الاستقبال. اتأكد من النت وجرب تاني.'
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background }}>
      <MapView
        ref={setMap}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={SHEBIN_EL_KOM}
        customMapStyle={BRAND_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        accessibilityLabel="الخريطة">
        {position ? (
          <Marker coordinate={position} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <CaptainMarker />
          </Marker>
        ) : null}
      </MapView>

      {/* Recenter */}
      <Pressable
        onPress={recenter}
        disabled={!position}
        accessibilityRole="button"
        accessibilityLabel="الرجوع لموقعي"
        style={{
          position: 'absolute',
          top: insets.top + 12,
          end: 16,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: BRAND.background,
          borderWidth: 1,
          borderColor: BRAND.line,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: position ? 1 : 0.5,
        }}>
        <LocateFixed size={22} color={BRAND.dark} />
      </Pressable>

      {/* Bottom area */}
      <View
        style={{
          position: 'absolute',
          start: 0,
          end: 0,
          bottom: TAB_BAR_CLEARANCE + insets.bottom,
          display: hasOffer || showOnlineSheet ? 'none' : 'flex',
        }}>
        {home.isLoading ? (
          <View
            style={{
              backgroundColor: BRAND.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderColor: BRAND.line,
              height: 220,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="جاري التحميل">
            <ActivityIndicator color={BRAND.primary} />
          </View>
        ) : home.isError || !summary ? (
          <View
            style={{
              backgroundColor: BRAND.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderColor: BRAND.line,
              padding: 24,
              gap: 12,
              alignItems: 'center',
            }}>
            <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
              ما قدرناش نحمّل بياناتك
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 14, textAlign: 'center' }}>
              اتأكد من النت واضغط أعد المحاولة.
            </Text>
            <Pressable
              onPress={() => home.refetch()}
              accessibilityRole="button"
              accessibilityLabel="أعد المحاولة"
              style={{
                height: 50,
                paddingHorizontal: 28,
                borderRadius: 12,
                backgroundColor: BRAND.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: BRAND.onPrimary, fontSize: 16, fontWeight: '700' }}>
                أعد المحاولة
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <HomeSheet
              summary={summary}
              blockers={blockers}
              warnings={warnings}
              online={online}
              backgroundActive={backgroundActive}
              actionError={actionError}
              onRetryAction={toggleOnline}
            />
            {/* The ring floats over the sheet's top edge */}
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                top: -RING_SIZE / 2,
                start: 0,
                end: 0,
                alignItems: 'center',
              }}>
              <GoalRingButton
                progress={progress}
                online={online}
                busy={availability.isPending}
                disabled={cannotToggle}
                onPress={toggleOnline}
              />
            </View>
          </>
        )}
      </View>
      {showOnlineSheet && summary ? (
        <OnlineSheet
          summary={summary}
          warnings={warnings}
          backgroundActive={backgroundActive}
          busy={availability.isPending}
          actionError={actionError}
          onStop={toggleOnline}
        />
      ) : null}

      {showOnlineSheet && !currentOrder && summary?.demandHint ? (
        <DemandChip text={summary.demandHint} />
      ) : null}

      <ActiveOrderBanner />
      <OfferOverlay />
    </View>
  );
}

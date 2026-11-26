// src/features/active-order/ui/order-map.tsx
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatDistance, formatMinutes } from '@/shared/lib/format-trip';
import type { OrderPlace } from '@/entities/offer/model/offer-types';
import { OrderRouteView } from '../service/use-order-route';
import { BRAND_MAP_STYLE } from '@/shared/config/map-style';

// Used only if the order has no usable coordinates (so the map never opens on 0,0).
const FALLBACK_REGION: Region = {
  latitude: 30.5595,
  longitude: 31.0094,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

function Dot({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: BRAND.background,
      }}
    />
  );
}

/** A region that contains both points with some breathing room. */
function regionFor(aLat: number, aLng: number, bLat: number, bLng: number): Region {
  const minLat = Math.min(aLat, bLat);
  const maxLat = Math.max(aLat, bLat);
  const minLng = Math.min(aLng, bLng);
  const maxLng = Math.max(aLng, bLng);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.01),
  };
}

type Props = {
  pickup: OrderPlace;
  destination: OrderPlace;
  /** The road to the next stop. null or empty coordinates: only the two markers are drawn. */
  route?: OrderRouteView | null;
};

export function OrderMap({ pickup, destination, route }: Props) {
  const insets = useSafeAreaInsets();
  const pLat = pickup.location.lat;
  const pLng = pickup.location.lng;
  const dLat = destination.location.lat;
  const dLng = destination.location.lng;
  const valid = [pLat, pLng, dLat, dLng].every((n) => Number.isFinite(n));

  const routeCoordinates = route?.coordinates ?? [];
  const hasRoute = routeCoordinates.length > 1;
  const legKey = route?.legKey ?? 'none';

  // 1) Open already zoomed on the order, so the map never starts on its default view.
  const initialRegion = useMemo(
    () => (valid ? regionFor(pLat, pLng, dLat, dLng) : FALLBACK_REGION),
    [valid, pLat, pLng, dLat, dLng]
  );

  // 2) Fit precisely once the native map is ready (calling earlier is silently ignored):
  //    to the whole order first, then to the road when it arrives, and again for the next
  //    stop. Not on every re-route, so the captain's own panning is not fought.
  const [map, setMap] = useState<MapView | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map || !ready || !valid) return;
    const points = hasRoute
      ? routeCoordinates
      : [
          { latitude: pLat, longitude: pLng },
          { latitude: dLat, longitude: dLng },
        ];
    map.fitToCoordinates(points, {
      edgePadding: { top: 110, right: 60, bottom: 60, left: 60 },
      animated: false,
    });
    // routeCoordinates is deliberately not a dependency: only a new stop or the first road refits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready, valid, legKey, hasRoute, pLat, pLng, dLat, dLng]);

  const eta =
    route?.durationSeconds != null && route.distanceMeters != null
      ? `${formatMinutes(route.durationSeconds)} · ${formatDistance(route.distanceMeters)}`
      : null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={setMap}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={BRAND_MAP_STYLE}
        initialRegion={initialRegion}
        onMapReady={() => setReady(true)}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        accessibilityLabel="خريطة الطلب">
        {hasRoute ? (
          <>
            {/* white casing under the line so it reads on any map color */}
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={9}
              strokeColor="#FFFFFF"
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={5}
              strokeColor={BRAND.teal}
              lineCap="round"
              lineJoin="round"
            />
          </>
        ) : null}
        {valid ? (
          <>
            <Marker coordinate={{ latitude: pLat, longitude: pLng }} tracksViewChanges={false}>
              <Dot color={BRAND.teal} />
            </Marker>
            <Marker coordinate={{ latitude: dLat, longitude: dLng }} tracksViewChanges={false}>
              <Dot color={BRAND.primary} />
            </Marker>
          </>
        ) : null}
      </MapView>

      {eta ? (
        <View
          accessible
          accessibilityLabel={`الوصول بعد ${eta}`}
          style={{
            position: 'absolute',
            top: insets.top + 12,
            start: 16,
            minHeight: 44,
            paddingHorizontal: 14,
            borderRadius: 22,
            justifyContent: 'center',
            backgroundColor: BRAND.background,
            borderWidth: 1,
            borderColor: BRAND.line,
          }}>
          <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>{eta}</Text>
        </View>
      ) : null}
    </View>
  );
}

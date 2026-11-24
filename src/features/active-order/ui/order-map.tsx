// src/features/active-order/ui/order-map.tsx
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BRAND } from '@/shared/config/theme';
import type { OrderPlace } from '@/entities/offer/model/offer-types';
import { BRAND_MAP_STYLE } from '@/shared/config/map-style';

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

export function OrderMap({ pickup, destination }: { pickup: OrderPlace; destination: OrderPlace }) {
  const [map, setMap] = useState<MapView | null>(null);
  const pLat = pickup.location.lat;
  const pLng = pickup.location.lng;
  const dLat = destination.location.lat;
  const dLng = destination.location.lng;

  useEffect(() => {
    if (!map) return;
    map.fitToCoordinates(
      [
        { latitude: pLat, longitude: pLng },
        { latitude: dLat, longitude: dLng },
      ],
      { edgePadding: { top: 90, right: 60, bottom: 60, left: 60 }, animated: true }
    );
  }, [map, pLat, pLng, dLat, dLng]);

  return (
    <MapView
      ref={setMap}
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      customMapStyle={BRAND_MAP_STYLE}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      accessibilityLabel="خريطة الطلب">
      <Marker coordinate={{ latitude: pLat, longitude: pLng }} tracksViewChanges={false}>
        <Dot color={BRAND.teal} />
      </Marker>
      <Marker coordinate={{ latitude: dLat, longitude: dLng }} tracksViewChanges={false}>
        <Dot color={BRAND.primary} />
      </Marker>
    </MapView>
  );
}

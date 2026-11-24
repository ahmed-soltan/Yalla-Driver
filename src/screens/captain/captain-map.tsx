import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Bell, LocateFixed, MapPin, RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestLocationPermission } from '@/shared/permissions/permissions';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { CaptainAvatar } from '@/features/captain/ui/captain-avatar';
import { router } from 'expo-router';
import { BRAND_MAP_STYLE } from '@/shared/config/map-style';

const DEFAULT_REGION: Region = {
  latitude: 30.5606,
  longitude: 31.0097,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F7F8FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#59636E' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F7F8FA' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D9DEE5' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#EEF1F3' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#FFF6CC' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#E5F0E8' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E1E5EA' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#FFE58A' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#FFC928' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#E5E8EC' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#DCEAF2' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6C8796' }],
  },
];

type LocationState = 'loading' | 'ready' | 'denied' | 'unavailable';
type Coordinate = Pick<Location.LocationObjectCoords, 'latitude' | 'longitude'>;

export function CaptainMapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [captainLocation, setCaptainLocation] = useState<Coordinate | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('loading');
  const [isLocating, setIsLocating] = useState(false);

  const locateCaptain = async () => {
    setIsLocating(true);

    try {
      const permissionStatus = await requestLocationPermission();
      if (permissionStatus !== 'granted') {
        setLocationState(permissionStatus === 'unavailable' ? 'unavailable' : 'denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextRegion: Region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setCaptainLocation(position.coords);
      setRegion(nextRegion);
      setLocationState('ready');
      mapRef.current?.animateToRegion(nextRegion, 500);
    } catch {
      setLocationState('unavailable');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const request = setTimeout(() => {
      void locateCaptain();
    }, 0);

    return () => clearTimeout(request);
  }, []);

  const openLocationSettings = () => {
    void Linking.openSettings();
  };

  const isLocationReady = locationState === 'ready';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1, marginTop: Platform.OS === 'android' ? -40 : 0 }}
          initialRegion={region}
          provider={Platform.OS === 'web' ? undefined : PROVIDER_GOOGLE}
          showsUserLocation={isLocationReady}
          customMapStyle={BRAND_MAP_STYLE}

          showsMyLocationButton={false}
          showsCompass
          toolbarEnabled={false}
          loadingEnabled
          onRegionChangeComplete={setRegion}>
          {captainLocation && (
            <Marker coordinate={captainLocation} title="موقعك الحالي" description="موقع الكابتن">
              <View className="items-center">
                <View className="rounded-full border-4 border-white bg-primary p-2 shadow-md">
                  <MapPin color="#1F2933" fill="#FFC928" size={22} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <View className="absolute left-5 right-5 top-4 flex-row-reverse  items-start justify-between">
          {/* <View className="rounded-2xl bg-white px-4 py-3 shadow-md shadow-black/10">
            <Text className="text-right text-lg font-bold text-foreground">الخريطة</Text>
            <Text variant="muted" className="text-right">
              {isLocationReady ? 'موقعك ظاهر على الخريطة' : 'جارٍ تحديد موقعك'}
            </Text>
          </View> */}
          <View className="gap-3">
            <Pressable
              accessibilityLabel="تحديد موقعي"
              accessibilityRole="button"
              className="size-14 items-center justify-center rounded-full bg-muted shadow-md shadow-black/10"
              disabled={isLocating}
              onPress={() => void locateCaptain()}>
              {isLocating ? (
                <ActivityIndicator color="#1F2933" />
              ) : (
                <LocateFixed color="#1F2933" size={20} />
              )}
            </Pressable>
            <Pressable
              accessibilityLabel="تحديد موقعي"
              accessibilityRole="button"
              className="size-14 items-center justify-center rounded-full bg-muted shadow-md shadow-black/10"
              disabled={isLocating}
              onPress={() => router.push('/(app)/notifications')}>
              <Bell color="#1F2933" size={18} />
            </Pressable>
          </View>

          <CaptainAvatar />
        </View>

        {locationState !== 'ready' && locationState !== 'loading' && (
          <View className="absolute bottom-24 left-5 right-5 rounded-2xl bg-white p-4 shadow-lg shadow-black/15">
            <Text className="text-right text-base font-bold">
              {locationState === 'denied' ? 'نحتاج إلى إذن الموقع' : 'تعذر تحديد موقعك الحالي'}
            </Text>
            <Text variant="muted" className="mt-1 text-right leading-6">
              {locationState === 'denied'
                ? 'فعّل إذن الموقع من إعدادات الهاتف لعرض موقعك على الخريطة.'
                : 'تحقق من تشغيل خدمة الموقع ثم حاول مرة أخرى.'}
            </Text>
            <View className="mt-3 flex-row-reverse  gap-2">
              <Button
                className="flex-1 rounded-xl"
                onPress={() => void locateCaptain()}
                disabled={isLocating}>
                <RefreshCw color="#FFFFFF" size={17} />
                <Text className="font-bold text-primary-foreground">حاول مرة أخرى</Text>
              </Button>
              {locationState === 'denied' && (
                <Button
                  className="flex-1 rounded-xl"
                  variant="outline"
                  onPress={openLocationSettings}>
                  <Text className="font-bold text-foreground">الإعدادات</Text>
                </Button>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

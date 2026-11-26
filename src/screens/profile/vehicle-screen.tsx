// src/screens/profile/vehicle-screen.tsx
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { BRAND } from '@/shared/config/theme';
import { vehicleFormHref } from '@/shared/lib/routes';
import { vehiclePhotoLabels } from '@/entities/captain/model/captain-types';
import {
  useSubmitVehiclePhoto,
  useVehicle,
  useVerification,
} from '@/features/profile/service/use-captain-profile';
import { ScreenHeader } from '@/shared/ui/screen-layout';
import { StatusChip } from '@/features/profile/ui/status-chip';
import { TAB_BAR_CLEARANCE } from '@/shared/config/tab-bar';

const VEHICLE_TYPE: Record<string, string> = {
  CAR: 'سيارة',
  MOTORCYCLE: 'موتوسيكل',
  SCOOTER: 'سكوتر',
  BICYCLE: 'عجلة',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingVertical: 12,
        gap: 12,
      }}>
      <Text style={{ color: BRAND.muted, fontSize: 14 }}>{label}</Text>
      <Text
        style={{
          color: BRAND.text,
          fontSize: 14,
          fontWeight: '700',
          flexShrink: 1,
          textAlign: 'right',
        }}>
        {value}
      </Text>
    </View>
  );
}

function FormButton({ label }: { label: string }) {
  return (
    <Pressable
      onPress={() => router.push(vehicleFormHref)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        height: 54,
        borderRadius: 14,
        backgroundColor: BRAND.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: BRAND.onPrimary, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function VehicleScreen() {
  const insets = useSafeAreaInsets();
  const vehicle = useVehicle();
  const verification = useVerification();
  const submitPhoto = useSubmitVehiclePhoto();
  const v = verification.data;
  const vehicleStatus = v?.vehicle.status;
  const needsFix = vehicleStatus === 'MISSING' || vehicleStatus === 'REJECTED';
  const rejectionReason = vehicle.data?.rejectionReason ?? v?.vehicle.rejectionReason ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.surface, paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE  }}>
      <ScreenHeader title="المركبة" />

      {vehicle.isLoading || verification.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND.primary} />
        </View>
      ) : !vehicle.data ? (
        // No vehicle yet (the API usually answers 404) or a real failure
        <View style={{ flex: 1, justifyContent: 'center', gap: 14, padding: 24 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
            {vehicleStatus === 'MISSING' ? 'لسه ما ضفتش مركبة' : 'ما قدرناش نحمّل بيانات المركبة'}
          </Text>
          {vehicleStatus === 'MISSING' ? (
            <FormButton label="ضيف المركبة" />
          ) : (
            <Pressable
              onPress={() => vehicle.refetch()}
              accessibilityRole="button"
              accessibilityLabel="أعد المحاولة"
              style={{
                height: 54,
                borderRadius: 14,
                backgroundColor: BRAND.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: BRAND.onPrimary, fontSize: 16, fontWeight: '700' }}>
                أعد المحاولة
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
            gap: 14,
          }}>
          <View
            style={{
              backgroundColor: BRAND.background,
              borderWidth: 1,
              borderColor: BRAND.line,
              borderRadius: 16,
              paddingHorizontal: 16,
            }}>
            <View
              style={{
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
              }}>
              <Text style={{ color: BRAND.text, fontSize: 18, fontWeight: '700' }}>
                {vehicle.data.make} {vehicle.data.model}
              </Text>
              <StatusChip status={vehicle.data.verificationStatus} />
            </View>
            <View style={{ height: 1, backgroundColor: BRAND.line }} />
            <Row label="النوع" value={VEHICLE_TYPE[vehicle.data.type] ?? vehicle.data.type} />
            <Row label="سنة الصنع" value={String(vehicle.data.year)} />
            <Row label="اللون" value={vehicle.data.color} />
            {vehicle.data.plateNumber ? (
              <Row label="رقم اللوحة" value={vehicle.data.plateNumber} />
            ) : null}
          </View>

          {needsFix ? (
            <>
              {rejectionReason ? (
                <Text style={{ color: BRAND.danger, fontSize: 14 }}>{rejectionReason}</Text>
              ) : null}
              <FormButton label="تعديل بيانات المركبة" />
            </>
          ) : null}

          {/* Photos: each is reviewed on its own */}
          {v?.vehicle.photos.length ? (
            <View style={{ gap: 10 }}>
              <Text
                accessibilityRole="header"
                style={{ color: BRAND.text, fontSize: 17, fontWeight: '700' }}>
                صور المركبة
              </Text>

              {v.vehicle.photos.map((photo) => {
                const editable = photo.status === 'MISSING' || photo.status === 'REJECTED';
                const sending =
                  submitPhoto.isPending && submitPhoto.variables?.photoType === photo.type;
                const failed =
                  submitPhoto.isError && submitPhoto.variables?.photoType === photo.type;
                return (
                  <View
                    key={photo.type}
                    style={{
                      backgroundColor: BRAND.background,
                      borderWidth: 1,
                      borderColor: BRAND.line,
                      borderRadius: 16,
                      padding: 16,
                      gap: 10,
                    }}>
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                      <Text style={{ flex: 1, color: BRAND.text, fontSize: 15, fontWeight: '700' }}>
                        صورة {vehiclePhotoLabels[photo.type]}
                      </Text>
                      <StatusChip status={photo.status} />
                    </View>

                    {photo.status === 'REJECTED' && photo.rejectionReason ? (
                      <Text style={{ color: BRAND.danger, fontSize: 13 }}>
                        {photo.rejectionReason}
                      </Text>
                    ) : null}
                    {photo.status === 'UNDER_REVIEW' || photo.status === 'PENDING' ? (
                      <Text style={{ color: BRAND.muted, fontSize: 13 }}>
                        بنراجع الصورة، وهنبلغك أول ما نخلّص.
                      </Text>
                    ) : null}

                    {editable ? (
                      <>
                        <ImageUploader
                          variant="compact"
                          size="md"
                          shape="square"
                          imageSource="camera-and-gallery"
                          label={`رفع صورة ${vehiclePhotoLabels[photo.type]}`}
                          disabled={submitPhoto.isPending}
                          onUploadComplete={(fileId) =>
                            submitPhoto.mutate({ photoType: photo.type, fileId })
                          }
                        />
                        {sending ? (
                          <View
                            style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                            <ActivityIndicator color={BRAND.primary} />
                            <Text style={{ color: BRAND.muted, fontSize: 13 }}>
                              جاري إرسال الصورة...
                            </Text>
                          </View>
                        ) : null}
                        {failed ? (
                          <Text style={{ color: BRAND.danger, fontSize: 13 }}>
                            ما قدرناش نبعت الصورة. ارفعها تاني.
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

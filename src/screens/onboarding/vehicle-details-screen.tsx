import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';

import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { ScreenError, ScreenHeader } from '@/shared/ui/screen-layout';
import {
  vehicleFieldLabels,
  vehicleTypeFields,
  type VehicleField,
} from '@/features/onboarding/model/vehicle-types';
import { Button } from '@/shared/ui/button';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;
const vehicleFieldPlaceholders: Record<VehicleField, string> = {
  make: 'مثال: Toyota',
  model: 'مثال: Corolla',
  year: 'مثال: 2022',
  color: 'مثال: أبيض',
  plateNumber: 'مثال: ABC 1234',
};
const vehicleImageFields = [
  {
    key: 'frontImage',
    label: 'الواجهة الأمامية',
    uploadLabel: 'ارفع صورة المركبة من الأمام',
    description: 'صوّر المركبة كاملة من الأمام مع ظهور اللوحة بوضوح.',
  },
  {
    key: 'sideImage',
    label: 'الجانب',
    uploadLabel: 'ارفع صورة المركبة من الجانب',
    description: 'صوّر المركبة كاملة من الجانب مع إظهار شكلها بوضوح.',
  },
  {
    key: 'rearImage',
    label: 'الواجهة الخلفية',
    uploadLabel: 'ارفع صورة المركبة من الخلف',
    description: 'صوّر المركبة كاملة من الخلف مع ظهور اللوحة بوضوح.',
  },
] as const;
type VehicleImageField = (typeof vehicleImageFields)[number]['key'];

export function VehicleDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const vehicleType = params.vehicleType as keyof typeof vehicleTypeFields;
  const fields = vehicleTypeFields[vehicleType] ?? [];
  const [values, setValues] = useState<Partial<Record<VehicleField, string>>>({});
  const [images, setImages] = useState<Partial<Record<VehicleImageField, string>>>({});
  const [imagePreviews, setImagePreviews] = useState<Partial<Record<VehicleImageField, string>>>(
    {}
  );
  const [touchedFields, setTouchedFields] = useState<Partial<Record<VehicleField, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setTimeout(() => Keyboard.dismiss(), 100);
  };

  const submit = () => {
    setHasSubmitted(true);
    if (
      fields.some((field) => !values[field]?.trim()) ||
      vehicleImageFields.some(({ key }) => !images[key])
    ) {
      return;
    }
    router.push({
      pathname: route('/onboarding/documents'),
      params: {
        ...params,
        vehicleMake: values.make ?? '',
        vehicleModel: values.model ?? '',
        vehicleYear: values.year ?? '',
        vehicleColor: values.color ?? '',
        plateNumber: values.plateNumber ?? '',
        ...images,
      },
    });
  };

  return (
    <OnboardingLayout currentStep={2}>
      <ScreenHeader
        title="بيانات المركبة"
        subtitle="اكتب البيانات المطلوبة للمركبة."
        back={false}
      />
      {fields.map((field) => {
        const showFieldError = (touchedFields[field] || hasSubmitted) && !values[field]?.trim();

        return (
          <View key={field} className="mb-3 w-full">
            <Text className="mb-2 w-full text-right text-base font-semibold text-foreground">
              {vehicleFieldLabels[field]}
            </Text>
            <TextInput
              accessibilityLabel={vehicleFieldLabels[field]}
              className={`min-h-14 w-full rounded-2xl border bg-card px-4 text-sm text-foreground ${
                showFieldError ? 'border-destructive' : 'border-border'
              }`}
              placeholder={vehicleFieldPlaceholders[field]}
              placeholderTextColor="#69737A"
              value={values[field] ?? ''}
              onChangeText={(value) => setValues((current) => ({ ...current, [field]: value }))}
              onBlur={() => setTouchedFields((current) => ({ ...current, [field]: true }))}
              textAlign="right"
              style={{ fontFamily: 'Cairo' }}
            />
            {showFieldError && (
              <Text className="mt-1 w-full text-right text-xs text-destructive">
                هذا الحقل مطلوب.
              </Text>
            )}
          </View>
        );
      })}
      <View className="mb-3 mt-4 w-full items-end rounded-3xl bg-secondary/10 p-4">
        <Text className="w-full text-right text-lg font-bold text-foreground">صور المركبة</Text>
        <Text className="mt-1 w-full text-right text-sm leading-6 text-muted-foreground">
          ارفع 3 صور واضحة للمركبة: صورة من الأمام، وصورة من الجانب، وصورة من الخلف.
        </Text>
        <Text className="mt-2 w-full text-right text-xs font-semibold text-secondary">
          جميع الصور مطلوبة
        </Text>
      </View>
      {vehicleImageFields.map(({ key, label, uploadLabel, description }) => (
        <View
          key={key}
          className="mb-4 w-full rounded-3xl border border-border bg-card p-4 shadow-sm shadow-black/5">
          <View className="mb-3 flex-row-reverse  items-center justify-between">
            <View className="flex-1 items-end">
              <Text className="w-full text-right text-base font-bold text-foreground">{label}</Text>
              <Text className="mt-1 w-full text-right text-xs font-semibold text-secondary">
                مطلوب
              </Text>
            </View>
            <View className="mr-3 size-9 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-base font-bold text-primary">
                {vehicleImageFields.findIndex((field) => field.key === key) + 1}
              </Text>
            </View>
          </View>
          <View onTouchStart={dismissKeyboard} onTouchEnd={dismissKeyboard}>
            <ImageUploader
              name={`vehicle-${key}`}
              variant="dropzone"
              label={uploadLabel}
              description={description}
              value={imagePreviews[key]}
              onUploadComplete={(fileId, url) => {
                setImages((current) => ({ ...current, [key]: fileId }));
                setImagePreviews((current) => ({ ...current, [key]: url }));
                dismissKeyboard();
              }}
              onError={dismissKeyboard}
            />
          </View>
          {hasSubmitted && !images[key] && (
            <Text className="mt-2 w-full text-right text-xs text-destructive">
              يجب رفع هذه الصورة للمتابعة.
            </Text>
          )}
        </View>
      ))}
      <ScreenError
        message={
          hasSubmitted &&
          (fields.some((field) => !values[field]?.trim()) ||
            vehicleImageFields.some(({ key }) => !images[key]))
            ? 'املأ كل البيانات المطلوبة.'
            : undefined
        }
      />
      <View className="flex-1" />
      <Button className="mt-6 min-h-14 w-full rounded-2xl" size="lg" onPress={submit}>
        <Text className="font-bold text-primary-foreground">متابعة</Text>
      </Button>
    </OnboardingLayout>
  );
}

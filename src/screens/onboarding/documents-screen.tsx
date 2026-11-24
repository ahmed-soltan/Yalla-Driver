import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { ScreenHeader } from '@/shared/ui/screen-layout';
import {
  vehicleDocumentLabels,
  vehicleDocumentRequirements,
  type DocumentUploadKey,
} from '@/features/onboarding/model/vehicle-documents';
import { Button } from '@/shared/ui/button';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;

export function DocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const vehicleType = params.vehicleType as keyof typeof vehicleDocumentRequirements;
  const requirements = vehicleDocumentRequirements[vehicleType] ?? [];
  const [documents, setDocuments] = useState<Partial<Record<DocumentUploadKey, string>>>({});
  const [documentPreviews, setDocumentPreviews] = useState<
    Partial<Record<DocumentUploadKey, string>>
  >({});
  const complete = requirements.every(({ documentType, isRequired, requiresBackSide }) => {
    if (!isRequired) return true;
    if (requiresBackSide) {
      return (
        Boolean(documents[`${documentType}_FRONT`]) && Boolean(documents[`${documentType}_BACK`])
      );
    }
    return Boolean(documents[`${documentType}_SINGLE`]);
  });

  const useMockDocuments = () => {
    const nextDocuments: Partial<Record<DocumentUploadKey, string>> = {};
    const nextPreviews: Partial<Record<DocumentUploadKey, string>> = {};
    requirements.forEach(({ documentType, isRequired, requiresBackSide }) => {
      if (!isRequired && documentType === 'VEHICLE_INSURANCE') return;
      const sides = requiresBackSide ? ['FRONT', 'BACK'] : ['SINGLE'];
      sides.forEach((side) => {
        const key = `${documentType}_${side}` as DocumentUploadKey;
        nextDocuments[key] = `dev-file-${key}`;
        nextPreviews[key] =
          `https://placehold.co/800x500/e8f1ef/2f6f68?text=${encodeURIComponent(vehicleDocumentLabels[documentType])}`;
      });
    });
    setDocuments(nextDocuments);
    setDocumentPreviews(nextPreviews);
  };

  return (
    <OnboardingLayout currentStep={3}>
      <ScreenHeader
        back={false}
        title="رفع المستندات"
        subtitle={
          vehicleType === 'BICYCLE'
            ? 'ارفع صورة واضحة للوجهين الأمامي والخلفي للبطاقة الشخصية.'
            : 'ارفع صور واضحة لكل وجه من المستندات المطلوبة.'
        }
      />
      {__DEV__ && (
        <Button
          className="mb-4 min-h-12 w-full rounded-2xl"
          size="lg"
          variant="secondary"
          onPress={useMockDocuments}>
          <Text className="font-bold text-secondary-foreground">استخدام مستندات تجريبية</Text>
        </Button>
      )}
      {requirements.map(({ documentType, isRequired, requiresBackSide }) => {
        const sides = requiresBackSide ? ['FRONT', 'BACK'] : ['SINGLE'];
        const uploaded = sides.every((side) =>
          Boolean(documents[`${documentType}_${side}` as DocumentUploadKey])
        );
        return (
          <View
            key={documentType}
            className="mb-4 w-full items-end justify-start rounded-2xl border border-border bg-card p-3">
            <View className="mb-2 flex-row-reverse  items-center gap-2">
              {uploaded && <CheckCircle2 size={18} color="#16A34A" />}
              <Text className="text-right font-semibold">
                {vehicleDocumentLabels[documentType]}
                {!isRequired ? ' (اختياري)' : ''}
              </Text>
            </View>
            <View className="w-full flex-row-reverse  gap-2">
              {sides.map((side) => {
                const key = `${documentType}_${side}` as DocumentUploadKey;
                return (
                  <View key={key} className="flex-1">
                    {requiresBackSide && (
                      <Text className="mb-1 w-full text-right text-xs text-muted-foreground">
                        {side === 'FRONT' ? 'الوجه الأمامي' : 'الوجه الخلفي'}
                      </Text>
                    )}
                    <ImageUploader
                      name={key}
                      variant="compact"
                      shape="square"
                      label="اختيار صورة"
                      imageSource="camera-and-gallery"
                      value={documentPreviews[key]}
                      onUploadComplete={(fileId, url) => {
                        setDocuments((current) => ({ ...current, [key]: fileId }));
                        setDocumentPreviews((current) => ({ ...current, [key]: url }));
                      }}
                      onError={() => undefined}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
      <Button
        className="mt-2 min-h-14 w-full rounded-2xl"
        size="lg"
        disabled={!complete}
        onPress={() =>
          router.push({
            pathname: route('/onboarding/review'),
            params: { ...params, ...documents },
          })
        }>
        <Text className="font-bold text-primary-foreground">مراجعة الطلب</Text>
      </Button>
    </OnboardingLayout>
  );
}

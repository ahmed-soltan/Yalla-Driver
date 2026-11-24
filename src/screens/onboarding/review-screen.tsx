import { useLocalSearchParams, useRouter } from 'expo-router';
import { CarFront, CheckCircle2, FileCheck2, Pencil, UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { ScreenHeader } from '@/shared/ui/screen-layout';
import { vehicleDocumentRequirements } from '@/features/onboarding/model/vehicle-documents';
import { useCompleteCaptainProfile } from '@/features/onboarding/services/use-complete-captain-profile';
import { useAuthStore } from '@/shared/hooks/auth-store';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const route = (path: string) => path as never;

export function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const mutation = useCompleteCaptainProfile();
  const requirements =
    vehicleDocumentRequirements[params.vehicleType as keyof typeof vehicleDocumentRequirements] ??
    [];
  const uploadedDocuments = requirements.filter(
    ({ documentType, isRequired, requiresBackSide }) => {
      if (!isRequired) return false;
      if (requiresBackSide) {
        return Boolean(params[`${documentType}_FRONT`]) && Boolean(params[`${documentType}_BACK`]);
      }
      return Boolean(params[`${documentType}_SINGLE`]);
    }
  ).length;
  const requiredDocumentCount = requirements.filter(({ isRequired }) => isRequired).length;
  const uploadedVehicleImages = ['frontImage', 'sideImage', 'rearImage'].filter((key) =>
    Boolean(params[key])
  ).length;

  const edit = (pathname: string) => {
    router.push({ pathname: route(pathname), params });
  };

  const submit = () => {
    const vehicleType = params.vehicleType as 'CAR' | 'MOTORCYCLE' | 'SCOOTER' | 'BICYCLE';
    const documents = requirements
      .filter(({ documentType, isRequired, requiresBackSide }) => {
        if (!isRequired) {
          return requiresBackSide
            ? Boolean(params[`${documentType}_FRONT`] || params[`${documentType}_BACK`])
            : Boolean(params[`${documentType}_SINGLE`]);
        }
        return true;
      })
      .map(({ documentType, requiresBackSide }) => ({
        documentType,
        files: (requiresBackSide ? ['FRONT', 'BACK'] : ['SINGLE'])
          .filter((side) => Boolean(params[`${documentType}_${side}`]))
          .map((side) => ({
            side: side as 'FRONT' | 'BACK' | 'SINGLE',
            fileUploadId: params[`${documentType}_${side}`],
          })),
      }));

    mutation.mutate(
      {
        fullName: params.fullName,
        email: params.email || undefined,
        avatarUrl: params.avatarUrl || undefined,
        dateOfBirth: params.dateOfBirth || undefined,
        gender: params.gender as 'MALE' | 'FEMALE',
        vehicle: {
          type: vehicleType,
          make: params.vehicleMake || '',
          model: params.vehicleModel || null,
          year: params.vehicleYear ? Number(params.vehicleYear) : null,
          color: params.vehicleColor || null,
          plateNumber: params.plateNumber || null,
        },
        vehiclePhotos: [
          { photoType: 'FRONT' as const, fileUploadId: params.frontImage },
          { photoType: 'SIDE' as const, fileUploadId: params.sideImage },
          { photoType: 'REAR' as const, fileUploadId: params.rearImage },
        ].filter((photo) => Boolean(photo.fileUploadId)),
        documents,
      },
      {
        onSuccess: async (user) => {
          useAuthStore.getState().setUser(user);
          router.replace(route('/onboarding/success'));
        },
      }
    );
  };

  return (
    <OnboardingLayout currentStep={4}>
      <ScreenHeader
        title="مراجعة الطلب"
        subtitle="راجع بياناتك قبل إرسال طلب الانضمام."
        back={false}
      />

      <ReviewCard
        title="البيانات الشخصية"
        summary={params.fullName}
        details={params.email || 'البريد الإلكتروني غير مضاف'}
        icon={UserRound}
        accent="primary"
        onPress={() => edit('/onboarding/profile')}
      />
      <ReviewCard
        title="بيانات المركبة"
        summary={params.vehicleType}
        details={
          params.vehicleType === 'BICYCLE'
            ? 'دراجة - لا توجد بيانات إضافية'
            : `${params.vehicleMake} ${params.vehicleModel} - ${params.vehicleYear}`
        }
        icon={CarFront}
        accent="secondary"
        onPress={() => edit('/onboarding/vehicle-type')}
      />
      <ReviewCard
        title="المستندات"
        summary={`${uploadedDocuments} من ${requiredDocumentCount} مستند`}
        details={
          uploadedDocuments === requiredDocumentCount
            ? 'اكتملت المستندات المطلوبة'
            : 'توجد مستندات ناقصة'
        }
        icon={FileCheck2}
        accent="success"
        complete={uploadedDocuments === requiredDocumentCount}
        onPress={() => edit('/onboarding/documents')}
      />
      <ReviewCard
        title="صور المركبة"
        summary={`${uploadedVehicleImages} من 3 صور`}
        details={uploadedVehicleImages === 3 ? 'اكتملت صور المركبة المطلوبة' : 'توجد صور ناقصة'}
        icon={CarFront}
        accent="secondary"
        complete={uploadedVehicleImages === 3}
        onPress={() => edit('/onboarding/vehicle-type')}
      />

      <View className="flex-1" />
      <Button
        className="mt-6 min-h-14 w-full rounded-2xl"
        size="lg"
        disabled={mutation.isPending}
        onPress={submit}>
        <Text className="font-bold text-primary-foreground">
          {mutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </Text>
      </Button>
    </OnboardingLayout>
  );
}

function ReviewCard({
  title,
  summary,
  details,
  icon: Icon,
  accent,
  complete = false,
  onPress,
}: {
  title: string;
  summary: string;
  details: string;
  icon: typeof UserRound;
  accent: 'primary' | 'secondary' | 'success';
  complete?: boolean;
  onPress: () => void;
}) {
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-700',
  } as const;

  return (
    <View className="mb-3 w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-black/5">
      <View className="flex-row-reverse  items-center gap-3 p-4">
        <View
          className={`size-12 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>
          <Icon
            size={23}
            color={
              accent === 'success' ? '#15803D' : accent === 'secondary' ? '#3D8078' : '#E8754D'
            }
          />
        </View>
        <View className="flex-1 items-end">
          <Text className="w-full text-right text-base font-bold text-foreground">{title}</Text>
          <Text className="mt-1 w-full text-right text-sm font-semibold text-foreground">
            {summary}
          </Text>
          <View className="mt-1 flex-row-reverse  items-center gap-1">
            {complete && <CheckCircle2 size={13} color="#15803D" />}
            <Text
              className={`text-right text-xs ${complete ? 'text-green-700' : 'text-muted-foreground'}`}>
              {details}
            </Text>
          </View>
        </View>
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel={`تعديل ${title}`}
          className="size-10 rounded-xl bg-muted/60"
          onPress={onPress}>
          <Pencil size={17} color="#3D8078" />
        </Button>
      </View>
      <View className="h-1 bg-primary/10" />
    </View>
  );
}

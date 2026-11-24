import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Phone, ShieldCheck, Star } from 'lucide-react-native';

import {
  useCaptainProfile,
  useUpdateCaptainProfile,
} from '@/features/captain/services/use-captain-profile';
// Adjust this import to wherever your schema and type live.

import { ScreenError, ScreenHeader, ScreenLayout } from '@/shared/ui/screen-layout';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { DateField } from '@/shared/ui/date-field';
import { formatDate } from '@/shared/lib/format-date';
import { CaptainProfileInput, captainProfileSchema } from '@/entities/user/model/profile-schema';
import { useAuthStore } from '@/shared/hooks/auth-store';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';

const route = (path: string) => path as never;

const verificationLabels: Record<string, string> = {
  VERIFIED: 'حساب موثق',
  UNDER_REVIEW: 'قيد المراجعة',
  PENDING: 'بانتظار التحقق',
  REJECTED: 'يحتاج إلى تحديث',
  SUSPENDED: 'الحساب موقوف',
};

export function CaptainProfileScreen() {
  const [submitError, setSubmitError] = useState('');

  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const profile = useCaptainProfile();
  const updateProfile = useUpdateCaptainProfile();

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CaptainProfileInput>({
    resolver: zodResolver(captainProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      avatarUrl: '',
      fullName: '',
      email: '',
      dateOfBirth: '',
      gender: undefined,
    },
    values: {
      avatarUrl: profile.data?.user.avatarUrl ?? '',
      fullName: profile.data?.user.fullName ?? '',
      email: profile.data?.user.email ?? '',
      dateOfBirth: profile.data?.dateOfBirth ?? '',
      gender: profile.data?.gender ?? 'MALE',
    },
    resetOptions: { keepDirtyValues: true },
  });

  const fullName = useWatch({ control, name: 'fullName' });
  const displayName =
    fullName?.trim() ||
    profile.data?.user.fullName?.trim() ||
    authUser?.fullName?.trim() ||
    'كابتن يلا';

  const onSubmit = (values: CaptainProfileInput) => {
    updateProfile.mutate(
      {
        fullName: values.fullName.trim(),
        email: values.email?.trim() || undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
      },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <ScreenLayout back={false}>
      <ScreenHeader title="الملف الشخصي" subtitle="تحكم في بيانات حسابك الأساسية." back={false} />

      {profile.isPending ? (
        <Text className="text-right text-muted-foreground">جاري تحميل بياناتك...</Text>
      ) : profile.isError ? (
        <View className="w-full">
          <Text className="mb-3 text-right text-muted-foreground">
            تعذر تحميل بياناتك. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.
          </Text>
          <Button
            variant="secondary"
            className="min-h-12 w-full rounded-2xl"
            onPress={() => profile.refetch()}>
            <Text className="font-bold text-secondary-foreground">إعادة المحاولة</Text>
          </Button>
        </View>
      ) : (
        <>
          <View className="mb-6 w-full overflow-hidden rounded-[28px] bg-primary shadow-sm shadow-black/15">
            <View className="absolute -right-12 -top-14 size-40 rounded-full bg-white/10" />
            <View className="absolute -bottom-16 -left-10 size-36 rounded-full bg-black/5" />
            <View className="relative p-5">
              <View className="flex-row-reverse  items-center gap-4">
                <Avatar alt="صورة الكابتن" className="size-20 border-2 border-white/70 bg-white/20">
                  <AvatarImage
                    source={{ uri: profile.data.user.avatarUrl ?? authUser?.avatarUrl ?? '' }}
                  />
                  <AvatarFallback className="bg-white/20">
                    <Text className="text-4xl font-bold text-primary-foreground">
                      {displayName.charAt(0) || '؟'}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                <View className="flex-1 items-end">
                  <Text className="text-right text-2xl font-bold text-primary-foreground">
                    {displayName}
                  </Text>
                  <Text className="mt-1 text-right text-sm text-primary-foreground/80">
                    كابتن يلا
                  </Text>
                  <View className="mt-2 flex-row-reverse  items-center gap-1.5">
                    <Phone size={14} color="#FFFFFF" />
                    <Text className="text-right text-xs text-primary-foreground/80">
                      {profile.data.user.phoneNumber}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-5 flex-row-reverse  gap-2">
                <View className="flex-1 rounded-2xl bg-white/15 p-3">
                  <Text className="text-right text-xs text-primary-foreground/75">التقييم</Text>
                  <View className="mt-1 flex-row-reverse  items-center gap-1.5">
                    <Star size={15} color="#FFF3B0" fill="#FFF3B0" />
                    <Text className="font-bold text-primary-foreground">
                      {profile.data.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View className="flex-1 rounded-2xl bg-white/15 p-3">
                  <Text className="text-right text-xs text-primary-foreground/75">
                    إجمالي الرحلات
                  </Text>
                  <Text className="mt-1 text-right font-bold text-primary-foreground">
                    {profile.data.tripsCount}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white/15 p-3">
                  <Text className="text-right text-xs text-primary-foreground/75">الحالة</Text>
                  <Text className="mt-1 text-right text-xs font-bold text-primary-foreground">
                    {verificationLabels[profile.data.verificationStatus] ??
                      profile.data.verificationStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <KeyboardAwareScrollView
            className="mb-12 flex-1"
            bottomOffset={Platform.OS === 'ios' ? 20 : 62}>
            <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={50}>
              <View className="mb-3 w-full items-center">
                <Text className="mb-2 w-full text-right text-sm text-muted-foreground">
                  الصورة الشخصية
                </Text>
                <ImageUploader
                  className="flex items-center justify-center"
                  name="passenger-avatar"
                  variant="avatar"
                  size="lg"
                  fallback={displayName.charAt(0)}
                  onUploadComplete={(_, url) =>
                    setValue('avatarUrl', url, { shouldDirty: true, shouldValidate: true })
                  }
                  onError={() => setSubmitError('تعذر رفع الصورة، حاول مرة أخرى.')}
                />
              </View>
              <View className="mb-3 w-full">
                <Text className="mb-2 w-full text-right text-sm text-muted-foreground">
                  الاسم بالكامل
                </Text>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      style={{ fontFamily: 'Cairo' }}
                      accessibilityLabel="الاسم بالكامل"
                      className="min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-sm text-black"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="مثال: أحمد محمد علي"
                      placeholderTextColor="#69737A"
                      textAlign="right"
                    />
                  )}
                />
                <ScreenError message={errors.fullName?.message} />
              </View>
              <View className="mb-3 w-full">
                <Text className="mb-2 w-full text-right text-sm text-muted-foreground">
                  البريد الإلكتروني
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      style={{ fontFamily: 'Cairo' }}
                      accessibilityLabel="البريد الإلكتروني"
                      className="min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="مثال: ahmed@example.com (اختياري)"
                      placeholderTextColor="#69737A"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      textAlign="right"
                    />
                  )}
                />
                <ScreenError message={errors.email?.message} />
              </View>
              <View className="mb-3 w-full">
                <Text className="mb-2 w-full text-right text-sm text-muted-foreground">
                  تاريخ الميلاد
                </Text>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field: { onChange, value } }) => (
                    <DateField
                      value={value ? new Date(`${value}T00:00:00`) : undefined}
                      placeholder="مثال: 15/04/1995"
                      onChange={(date) => onChange(formatDate(date))}
                    />
                  )}
                />
                <ScreenError message={errors.dateOfBirth?.message} />
              </View>
              <ScreenError message={submitError} />
              <View className="flex-1" />
              <Button
                className="mt-3 min-h-14 w-full rounded-2xl"
                size="lg"
                onPress={handleSubmit(onSubmit)}>
                <Text className="font-bold text-primary-foreground">متابعة</Text>
              </Button>
            </KeyboardAvoidingView>
          </KeyboardAwareScrollView>
        </>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(route('/(app)/verification'))}
        className="mt-5 w-full flex-row-reverse  items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 active:opacity-70">
        <View className="size-10 items-center justify-center rounded-full bg-primary/15">
          <ShieldCheck size={20} color="#B88A00" />
        </View>
        <View className="flex-1">
          <Text className="text-right text-base font-semibold">حالة التحقق والمستندات</Text>
          <Text className="text-right text-sm text-muted-foreground">
            راجع المستندات وأكمل أي نقص قبل بدء الرحلات.
          </Text>
        </View>
        <ChevronLeft size={21} color="#69737A" />
      </Pressable>
    </ScreenLayout>
  );
}

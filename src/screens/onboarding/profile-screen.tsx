import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  captainProfileSchema,
  type CaptainProfileInput,
} from '@/entities/user/model/profile-schema';
import { OnboardingLayout } from '@/features/onboarding/ui/onboarding-layout';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { ScreenError, ScreenHeader } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';
import { formatDate } from '@/shared/lib/format-date';

const route = (path: string) => path as never;

export function ProfileScreen() {
  const [submitError, setSubmitError] = useState('');
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CaptainProfileInput>({
    resolver: zodResolver(captainProfileSchema),
    defaultValues: {
      avatarUrl: '',
      fullName: '',
      email: '',
      dateOfBirth: '',
      gender: undefined,
    },
  });
  const gender = useWatch({ control, name: 'gender' });

  const goNext = (values: CaptainProfileInput) => {
    setSubmitError('');
    router.push({
      pathname: route('/onboarding/vehicle-type'),
      params: {
        avatarUrl: values.avatarUrl ?? '',
        fullName: values.fullName,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
      },
    });
  };

  return (
    <OnboardingLayout currentStep={1}>
      <KeyboardAwareScrollView
        className="mb-12 flex-1"
        bottomOffset={Platform.OS === 'ios' ? 20 : 62}>
        <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={50}>
          <ScreenHeader
            back={false}
            title="خلينا نتعرف عليك"
            subtitle="بيانات بسيطة علشان نقدر نجهز حسابك ككابتن"
          />
          <View className="mb-3 w-full items-center">
            <Text className="mb-2 w-full text-right text-sm text-muted-foreground">
              الصورة الشخصية
            </Text>
            <ImageUploader
              className="flex items-center justify-center"
              name="passenger-avatar"
              variant="avatar"
              size="lg"
              fallback="؟"
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
          <View className="mb-3 w-full">
            <Text className="mb-2 w-full text-right text-sm text-muted-foreground">النوع</Text>
            <Controller
              control={control}
              name="gender"
              render={() => (
                <View className="w-full flex-row-reverse gap-3">
                  {[
                    { value: 'MALE' as const, label: 'ذكر' },
                    { value: 'FEMALE' as const, label: 'أنثى' },
                  ].map((option) => (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: gender === option.value }}
                      className={`min-h-14 flex-1 items-center justify-center rounded-2xl border ${
                        gender === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      }`}
                      onPress={() =>
                        setValue('gender', option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }>
                      <Text className="text-sm text-foreground">{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            <ScreenError message={errors.gender?.message} />
          </View>
          <ScreenError message={submitError} />
          <View className="flex-1" />
          <Button
            className="mt-3 min-h-14 w-full rounded-2xl"
            size="lg"
            onPress={handleSubmit(goNext)}>
            <Text className="font-bold text-primary-foreground">متابعة</Text>
          </Button>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollView>
    </OnboardingLayout>
  );
}

// src/screens/profile/edit-profile-screen.tsx
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { DateField } from '@/shared/ui/date-field';
import { formatDate } from '@/shared/lib/format-date';
import { BRAND } from '@/shared/config/theme';
import { useProfile, useUpdateProfile } from '@/features/profile/service/use-captain-profile';
import { ScreenHeader } from '@/shared/ui/screen-layout';

const schema = z.object({
  fullName: z.string().trim().min(3, 'الاسم لازم يكون ٣ حروف على الأقل'),
  email: z.union([z.literal(''), z.string().trim().email('الإيميل مش صحيح')]),
  dateOfBirth: z.string(),
});
type FormValues = z.infer<typeof schema>;

const inputStyle = {
  height: 52,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: BRAND.line,
  paddingHorizontal: 14,
  fontSize: 13,
  color: BRAND.text,
  textAlign: 'right' as const,
  fontFamily: 'Cairo',
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      {children}
      {error ? <Text style={{ color: BRAND.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const update = useUpdateProfile();
  const p = profile.data;

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: p
      ? {
          fullName: p.user.fullName,
          email: p.user.email ?? '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
        }
      : undefined,
  });

  const onSubmit = handleSubmit((v) =>
    update.mutate(
      {
        fullName: v.fullName.trim(),
        email: v.email || undefined,
        dateOfBirth: v.dateOfBirth || undefined,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'تم حفظ بياناتك' });
          router.back();
        },
      }
    )
  );

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background, paddingTop: insets.top + 20 }}>
      <ScreenHeader title="بياناتي" />

      {profile.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND.primary} />
        </View>
      ) : !p ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
            ما قدرناش نحمّل بياناتك
          </Text>
          <Pressable
            onPress={() => profile.refetch()}
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
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: insets.bottom + 20 }}>
            <Field label="الاسم بالكامل" error={formState.errors.fullName?.message}>
              <Controller
                control={control}
                name="fullName"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    onChangeText={field.onChange}
                    editable={!update.isPending}
                    accessibilityLabel="الاسم بالكامل"
                    style={inputStyle}
                  />
                )}
              />
            </Field>

            <Field label="رقم الموبايل">
              <View
                style={{ ...inputStyle, justifyContent: 'center', backgroundColor: BRAND.surface }}>
                <Text style={{ color: BRAND.muted, fontSize: 16, textAlign: 'right' }}>
                  {p.user.phoneNumber}
                </Text>
              </View>
              <Text style={{ color: BRAND.muted, fontSize: 12 }}>
                رقم الموبايل مرتبط بحسابك ومش بيتغيّر من هنا.
              </Text>
            </Field>

            <Field label="الإيميل (اختياري)" error={formState.errors.email?.message}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    onChangeText={field.onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!update.isPending}
                    accessibilityLabel="الإيميل"
                    style={{ ...inputStyle, textAlign: 'left' }}
                  />
                )}
              />
            </Field>

            <Field label="تاريخ الميلاد (اختياري)">
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DateField
                    value={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                    onChange={(date) => field.onChange(formatDate(date))}
                    placeholder="اختار تاريخ الميلاد"
                    label="تاريخ الميلاد"
                    maximumDate={new Date()}
                    defaultDate={new Date(2000, 0, 1)}
                  />
                )}
              />
            </Field>

            {update.isError ? (
              <Text style={{ color: BRAND.danger, fontSize: 14 }}>
                ما قدرناش نحفظ بياناتك. جرب تاني.
              </Text>
            ) : null}
          </ScrollView>

          <View
            style={{
              padding: 20,
              paddingBottom: insets.bottom + 16,
              borderTopWidth: 1,
              borderTopColor: BRAND.line,
            }}>
            <Pressable
              onPress={onSubmit}
              disabled={update.isPending}
              accessibilityRole="button"
              accessibilityLabel="حفظ"
              accessibilityState={{ disabled: update.isPending, busy: update.isPending }}
              style={{
                height: 48,
                borderRadius: 14,
                backgroundColor: BRAND.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {update.isPending ? (
                <ActivityIndicator color={BRAND.onPrimary} />
              ) : (
                <Text style={{ color: BRAND.onPrimary, fontSize: 15, fontWeight: '700' }}>حفظ</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, TextInput, View } from 'react-native';

import { useRequestOtp } from '@/features/auth/services/use-request-otp';
import { normalizeEgyptianPhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { ScreenError, ScreenHeader, ScreenLayout } from '@/shared/ui/screen-layout';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const route = (path: string) => path as never;

export function PhoneScreen() {
  const router = useRouter();
  const { mode = 'signup' } = useLocalSearchParams<{ mode?: 'signup' | 'login' }>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const mutation = useRequestOtp(mode);

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const submit = () => {
    const normalized = normalizeEgyptianPhone(phone);
    if (!normalized) {
      setError('اكتب رقم موبايل مصري صحيح.');
      return;
    }

    setError('');
    mutation.mutate(normalized, {
      onSuccess: async () => {
        router.push(
          route(
            `/(auth)/verify?mode=${mode}&phone=${encodeURIComponent(normalized)}`
          )
        );
        Keyboard.dismiss();
      },
      onError: () => setError('حدث خطأ، حاول مرة أخرى.'),
    });
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={35}>
        <ScreenHeader
          back={false}
          title="أدخل رقم هاتفك"
          subtitle={
            __DEV__
              ? 'وضع التطوير مفعّل: استخدم أي رمز مكون من 6 أرقام في الخطوة التالية.'
              : 'هنبعتلك رمز التحقق في رسالة SMS عشان نقدر نكمل تسجيلك.'
          }
        />
        <TextInput
          accessibilityLabel="رقم الهاتف"
          className="mb-3 min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="01012345678"
          placeholderTextColor="#69737A"
          textAlign="left"
        />
        <ScreenError message={error} />
        <Button
          className="mt-3 min-h-14 w-full rounded-2xl"
          size="lg"
          onPress={submit}
          disabled={mutation.isPending}>
          <Text className="font-bold text-primary-foreground">
            {mutation.isPending ? 'جاري الإرسال...' : 'متابعة'}
          </Text>
        </Button>
        {/* <View className="my-10 w-full flex-row-reverse items-center">
          <View className="h-px flex-1 bg-border" />
          <Text className="mx-3 text-sm text-muted-foreground">أو</Text>
          <View className="h-px flex-1 bg-border" />
        </View> */}
        {/* <TouchableOpacity
          className="h-14 w-full flex-row-reverse items-center justify-center gap-4 rounded-2xl border border-border bg-white"
          activeOpacity={0.8}>
          <View className="items-center justify-center">
            <Image
              source={require('../../../assets/google.png')}
              contentFit="contain"
              style={{ width: 30, height: 30 }}
            />
          </View>

          <Text className="text-base font-semibold text-foreground">المتابعة باستخدام Google</Text>
        </TouchableOpacity> */}
        <View className="flex-1" />
        <View className="mb-5 w-full max-w-[500px] flex-row-reverse  flex-wrap items-center justify-center gap-1">
          <Text className="text-center text-xs font-semibold leading-5 text-muted-foreground">
            بالمتابعة، أنت توافق على
          </Text>
          <Link href="/terms">
            <Text className="text-sm font-bold text-secondary">شروط الاستخدام</Text>
          </Link>
          <Text className="text-center text-xs font-semibold leading-5 text-muted-foreground">
            و
          </Text>
          <Link href="/privacy">
            <Text className="text-sm font-bold text-secondary">سياسة الخصوصية</Text>
          </Link>
          <Text className="text-center text-xs font-semibold leading-5 text-muted-foreground">
            الخاصة بنا.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

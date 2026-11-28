import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, TextInput, View } from 'react-native';

import { useRequestOtp } from '@/features/auth/services/use-request-otp';
import { useVerifyOtp } from '@/features/auth/services/use-verify-otp';
import { useAuthStore } from '@/shared/hooks/auth-store';
import { formatPhoneForDisplay } from '@/shared/lib/phone';
import { secureStorage, storageKeys } from '@/shared/lib/storage';
import { Text } from '@/shared/ui/text';
import { ScreenError, ScreenLayout } from '@/shared/ui/screen-layout';
import { cn } from '@/shared/lib/cn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Image } from 'expo-image';

const route = (path: string) => path as never;

export function VerifyScreen() {
  const router = useRouter();
  const {
    mode = 'signup',
    phone = '',
  } = useLocalSearchParams<{
    mode?: 'signup' | 'login';
    phone?: string;
    verificationId?: string;
  }>();
  const [code, setCode] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const mutation = useVerifyOtp(mode);
  const resend = useRequestOtp(mode);

  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const submit = async (nextCode = code) => {
    if (mutation.isPending || isSubmitting) return;
    if (!/^\d{6}$/.test(nextCode)) {
      setError('اكتب رمز التحقق المكون من 6 أرقام.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    mutation.mutate(
      {
        phoneNumber: phone,
        code: nextCode,
      },
      {
        onSuccess: async (tokens) => {
          await useAuthStore.getState().signIn(tokens);
          router.replace(
            route(
              tokens.requiresProfileCompletion ? '/onboarding/profile' : '/onboarding/permissions'
            )
          );
        },
        onError: () => {
          setIsSubmitting(false);
          setError('رمز التحقق غير صحيح أو انتهت صلاحيته.');
        },
      }
    );
  };

  const handleDigitChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (nextValue.length > 1) {
      nextValue
        .slice(0, 6 - index)
        .split('')
        .forEach((digit, offset) => {
          nextDigits[index + offset] = digit;
        });
      setDigits(nextDigits);
      const nextCode = nextDigits.join('');
      setCode(nextCode);
      setError('');
      const focusIndex = Math.min(index + nextValue.length, 5);
      inputRefs.current[focusIndex]?.focus();
      if (nextCode.length === 6) void submit(nextCode);
      return;
    }

    nextDigits[index] = nextValue;
    setDigits(nextDigits);
    const nextCode = nextDigits.join('');
    setCode(nextCode);
    setError('');

    if (nextValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (nextCode.length === 6) {
      void submit(nextCode);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    resend.mutate(phone, {
      onSuccess: async (result) => {
        await secureStorage.set(storageKeys.verificationId, result.verificationId);
        setCode('');
        setDigits(Array(6).fill(''));
        setSeconds(45);
        setError('');
        inputRefs.current[0]?.focus();
      },
      onError: () => setError('تعذر إرسال رمز جديد، حاول مرة أخرى.'),
    });
  };

  return (
    <ScreenLayout>
      <KeyboardAwareScrollView
        className="mb-12 flex-1"
        bottomOffset={Platform.OS === 'ios' ? 20 : 62}>
        <Image
          source={require('../../../assets/otp.png')}
          contentFit="contain"
          style={{ width: '100%', height: 300 }}
        />
        <View className="mb-7 mt-6 items-end">
          <Text variant="h2" className="w-full text-right font-bold leading-relaxed">
            أدخل رمز التحقق
          </Text>
          <Text variant="muted" className="w-full text-right text-lg leading-9">
            بعتنالك رمز مكون من 6 أرقام على{' '}
            <Text className="font-bold text-secondary">{formatPhoneForDisplay(phone)}</Text>
          </Text>
        </View>
        <View className="mb-3 w-full flex-row-reverse justify-between gap-2">
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                inputRefs.current[index] = input;
              }}
              accessibilityLabel={`رقم ${index + 1} من رمز التحقق`}
              autoFocus={index === 0}
              className={cn(
                'h-14 min-w-0 flex-1 rounded-2xl border bg-card text-center text-2xl text-foreground',
                error ? 'border-destructive' : 'border-border',
                isSubmitting || resend.isPending ? 'opacity-50' : ''
              )}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => handleDigitChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              selectTextOnFocus
              value={digit}
              editable={!isSubmitting && !resend.isPending}
            />
          ))}
        </View>
        {isSubmitting && (
          <View className="mb-3 flex-row-reverse items-center justify-center gap-2">
            <ActivityIndicator color="#E8754D" />
            <Text className="font-semibold text-primary">جاري التحقق من الرمز...</Text>
          </View>
        )}
        <ScreenError message={error} />
        <Pressable
          disabled={seconds > 0 || isSubmitting || resend.isPending}
          onPress={handleResend}
          className="flex w-full flex-row-reverse items-center justify-center">
          <Text
            variant="muted"
            className={cn(
              ' my-3 w-full text-center',
              seconds ? 'text-muted-foreground' : 'text-black'
            )}>
            {seconds
              ? `إعادة إرسال الرمز بعد ${seconds} ثانية`
              : resend.isPending
                ? 'جاري الإرسال...'
                : 'إعادة إرسال الرمز'}
          </Text>
        </Pressable>
        <View className="flex-1" />
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

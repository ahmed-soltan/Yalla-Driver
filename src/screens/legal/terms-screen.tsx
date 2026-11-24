import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

export function TermsScreen() {
  return (
    <View className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
      <Text className="text-2xl font-bold">شروط الاستخدام</Text>
      <Text className="text-center text-base text-muted-foreground">
        هذه الصفحة تعرض شروط الاستخدام الخاصة بالتطبيق. يمكنك تعديل المحتوى هنا وفقًا لاحتياجاتك.
      </Text>
    </View>
  );
}

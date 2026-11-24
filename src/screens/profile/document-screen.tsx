// src/screens/profile/documents-screen.tsx
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { profileHref } from '@/shared/lib/routes';
import { DocumentCard } from '@/features/profile/ui/document-card';
import { useVerification } from '@/features/profile/service/use-captain-profile';
import { ScreenHeader } from '@/shared/ui/screen-layout';

export function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const verification = useVerification();
  const v = verification.data;
  // Required documents first, optional ones last
  const docs = v
    ? [...v.requiredDocuments].sort((a, b) => Number(b.isRequired) - Number(a.isRequired))
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.surface, paddingTop: insets.top + 20 }}>
      <ScreenHeader title="المستندات" />

      {verification.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND.primary} />
        </View>
      ) : verification.isError || !v ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
            ما قدرناش نحمّل المستندات
          </Text>
          <Pressable
            onPress={() => verification.refetch()}
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
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}>
          {v.rejectionReason ? (
            <View
              style={{
                backgroundColor: BRAND.background,
                borderWidth: 1,
                borderColor: BRAND.danger,
                borderRadius: 14,
                padding: 14,
                gap: 4,
              }}>
              <Text style={{ color: BRAND.danger, fontSize: 14, fontWeight: '700' }}>
                سبب الرفض
              </Text>
              <Text style={{ color: BRAND.text, fontSize: 14 }}>{v.rejectionReason}</Text>
            </View>
          ) : null}

          {docs.map((doc) => (
            <DocumentCard
              key={`${doc.type}-${doc.vehicleId ?? 'personal'}`}
              doc={doc}
              onPress={() => router.push(profileHref.document(doc.type))}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

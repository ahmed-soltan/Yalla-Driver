// src/screens/profile/profile-screen.tsx
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  Car,
  Clock,
  FileText,
  LogOut,
  TriangleAlert,
  UserPen,
  type LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { TAB_BAR_CLEARANCE } from '@/shared/config/tab-bar';
import { formatNumber } from '@/shared/lib/format-money';
import { profileHref } from '@/shared/lib/routes';

import { getGoOnlineBlockers } from '@/features/home/model/go-online-blockers';
import {
  useLogout,
  useProfile,
  useVerification,
} from '@/features/profile/service/use-captain-profile';
import { useCurrentOrder } from '@/features/active-order/service/use-active-order';
import { getDocumentWarnings } from '@/entities/captain/lib/captain-alerts';
import { StatusChip } from '@/features/profile/ui/status-chip';
import { MenuCard, MenuRow } from '@/features/profile/ui/menu-row';
import { ProfileHeader } from '@/features/profile/ui/profile-header';

function Badge({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: BRAND.primarySoft,
      }}>
      <Text style={{ color: BRAND.primary, fontSize: 12, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const verification = useVerification();
  const { data: currentOrder } = useCurrentOrder();
  const logout = useLogout();

  if (profile.isLoading || verification.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.surface,
        }}>
        <ActivityIndicator color={BRAND.primary} />
      </View>
    );
  }

  if (profile.isError || verification.isError || !profile.data || !verification.data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          backgroundColor: BRAND.surface,
        }}>
        <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
          ما قدرناش نحمّل ملفك
        </Text>
        <Pressable
          onPress={() => {
            profile.refetch();
            verification.refetch();
          }}
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
    );
  }

  const v = verification.data;
  // Only required documents count; EXPIRED needs action just like MISSING and REJECTED
  const needsAction = v.requiredDocuments.filter(
    (d) =>
      d.isRequired && (d.status === 'MISSING' || d.status === 'REJECTED' || d.status === 'EXPIRED')
  ).length;
  const blocker = getGoOnlineBlockers(v)[0];
  const warning = getDocumentWarnings(v)[0];

  const confirmLogout = () => {
    if (currentOrder) {
      Alert.alert('عندك طلب شغال', 'خلّص الطلب الحالي أو الغيه قبل ما تسجّل خروج.');
      return;
    }
    Alert.alert('تسجيل الخروج', 'هتتوقف عن استقبال الطلبات. متأكد؟', [
      { text: 'لأ', style: 'cancel' },
      { text: 'اخرج', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const row = (
    Icon: LucideIcon,
    label: string,
    href: Parameters<typeof router.push>[0],
    trailing?: React.ReactNode
  ) => <MenuRow Icon={Icon} label={label} trailing={trailing} onPress={() => router.push(href)} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BRAND.surface }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: TAB_BAR_CLEARANCE + insets.bottom + 16,
        gap: 16,
      }}>
      <Text
        accessibilityRole="header"
        style={{ color: BRAND.text, fontSize: 26, fontWeight: '700', lineHeight: 32 }}>
        الملف الشخصي
      </Text>

      <ProfileHeader profile={profile.data} />

      {blocker ? (
        <Pressable
          onPress={() => router.push(profileHref.documents)}
          accessibilityRole="button"
          accessibilityLabel={`${blocker.message}. افتح المستندات`}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 10,
            backgroundColor: BRAND.background,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: BRAND.danger,
            padding: 14,
          }}>
          <TriangleAlert size={22} color={BRAND.danger} />
          <Text style={{ flex: 1, color: BRAND.text, fontSize: 14 }}>{blocker.message}</Text>
        </Pressable>
      ) : null}

      {!blocker && warning ? (
        <Pressable
          onPress={() => router.push(profileHref.document(warning.documentType))}
          accessibilityRole="button"
          accessibilityLabel={`${warning.message}. جدّد المستند`}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 10,
            backgroundColor: BRAND.primarySoft,
            borderRadius: 14,
            padding: 14,
          }}>
          <Clock size={22} color={BRAND.primary} />
          <Text style={{ flex: 1, color: BRAND.text, fontSize: 14 }}>{warning.message}</Text>
          <Text style={{ color: BRAND.primary, fontSize: 14, fontWeight: '700' }}>جدّد</Text>
        </Pressable>
      ) : null}

      <MenuCard>
        {row(UserPen, 'بياناتي', profileHref.edit)}
        {row(
          FileText,
          'المستندات',
          profileHref.documents,
          needsAction > 0 ? (
            <Badge text={`${formatNumber(needsAction)} مطلوب`} />
          ) : warning ? (
            <Badge text="قرّب ينتهي" />
          ) : undefined
        )}
        {row(Car, 'المركبة', profileHref.vehicle, <StatusChip status={v.vehicle.status} />)}
      </MenuCard>

      <MenuCard>
        <MenuRow
          Icon={LogOut}
          label="تسجيل الخروج"
          danger
          chevron={false}
          onPress={confirmLogout}
        />
      </MenuCard>

      <Text style={{ color: BRAND.muted, fontSize: 12, textAlign: 'center' }}>
        الإصدار {Constants.expoConfig?.version ?? ''}
      </Text>
    </ScrollView>
  );
}

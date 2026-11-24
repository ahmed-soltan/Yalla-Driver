// src/features/home/ui/online-sheet.tsx
// While the captain is online and waiting, Home shows only this slim bar so the map stays
// visible. Drag it up (or tap the arrow) for today's stats. Needs <GestureHandlerRootView>
// at the app root, like any @gorhom/bottom-sheet.
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney } from '@/shared/lib/format-money';
import type { CaptainHomeSummary } from '../services/use-captain-home';
import { TodayStats, type SheetBlocker } from './home-sheet';
import { WarningList } from './warning-list';

const COLLAPSED = 92;
const EXPANDED = 460;
const ERROR_EXTRA = 44;

type Props = {
  summary: CaptainHomeSummary;
  warnings: SheetBlocker[];
  backgroundActive: boolean;
  busy: boolean;
  actionError: string | null;
  onStop: () => void;
};

export function OnlineSheet({
  summary,
  warnings,
  backgroundActive,
  busy,
  actionError,
  onStop,
}: Props) {
  const [index, setIndex] = useState(0);
  const expanded = index === 1;
  const { today } = summary;

  // Room for the error line when going offline failed
  const snapPoints = useMemo(
    () => [COLLAPSED + (actionError ? ERROR_EXTRA : 0), EXPANDED],
    [actionError]
  );

  const goalPercent =
    today.goalPiastres > 0
      ? Math.min(100, Math.round((today.earningsPiastres / today.goalPiastres) * 100))
      : null;
  const Chevron = expanded ? ChevronDown : ChevronUp;

  return (
    <BottomSheet
      index={index}
      onChange={(i) => setIndex(i)}
      snapPoints={snapPoints}
      bottomInset={0}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: BRAND.line, width: 40 }}
      backgroundStyle={{
        backgroundColor: BRAND.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: BRAND.line,
      }}>
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}>
        {/* Always visible: status, today's earnings, stop */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={() => setIndex(expanded ? 0 : 1)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            accessibilityState={{ expanded }}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Chevron size={22} color={BRAND.muted} />
          </Pressable>

          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
              <View
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.teal }}
              />
              <Text style={{ color: BRAND.text, fontSize: 17, fontWeight: '700' }}>أونلاين</Text>
            </View>
            <Text style={{ color: BRAND.muted, fontSize: 13 }}>
              النهاردة {formatMoney(today.earningsPiastres)}
            </Text>
          </View>

          <Pressable
            onPress={onStop}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="إيقاف استقبال الطلبات"
            accessibilityState={{ disabled: busy, busy }}
            style={{
              minWidth: 72,
              height: 42,
              borderRadius: 14,
              backgroundColor: BRAND.dark,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
            }}>
            {busy ? (
              <ActivityIndicator color={BRAND.onPrimary} />
            ) : (
              <Text style={{ color: BRAND.onPrimary, fontSize: 14, fontWeight: '700' }}>وقف</Text>
            )}
          </Pressable>
        </View>

        {actionError ? (
          <Text style={{ color: BRAND.danger, fontSize: 14 }}>{actionError}</Text>
        ) : null}

        {/* Drag up to see these */}
        <TodayStats today={today} />

        {goalPercent != null ? (
          <View
            accessible
            accessibilityLabel={`حققت ${goalPercent} في المية من هدف النهاردة`}
            style={{ gap: 6 }}>
            <Text style={{ color: BRAND.text, fontSize: 14 }}>
              حققت {formatMoney(today.earningsPiastres)} من {formatMoney(today.goalPiastres)}
            </Text>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: BRAND.line,
                overflow: 'hidden',
              }}>
              <View style={{ width: `${goalPercent}%`, height: 8, backgroundColor: BRAND.teal }} />
            </View>
          </View>
        ) : null}

        <WarningList warnings={warnings} />

        {!backgroundActive ? (
          <Text style={{ color: BRAND.muted, fontSize: 13 }}>
            التطبيق بيستقبل الطلبات وهو مفتوح بس. فعّل الموقع &quot;دايمًا&quot; عشان توصلك الطلبات
            والشاشة مقفولة.
          </Text>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

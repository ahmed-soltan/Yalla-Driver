// src/features/home/ui/home-sheet.tsx
import { Pressable, View } from 'react-native';
import { CircleAlert, TrendingUp } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney, formatNumber, formatRating } from '@/shared/lib/format-money';
import { RING_SIZE } from '../constants/home-constants';
import { WarningList } from './warning-list';
import { CaptainHomeSummary } from '../services/use-captain-home';

export type SheetBlocker = {
  key: string;
  message: string;
  fixLabel?: string;
  onFix?: () => void;
};

type Props = {
  summary: CaptainHomeSummary;
  blockers: SheetBlocker[];
  warnings: SheetBlocker[];
  online: boolean;
  backgroundActive: boolean;
  actionError: string | null;
  onRetryAction: () => void;
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ color: BRAND.text, fontSize: 18, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: BRAND.muted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function TodayStats({ today }: { today: CaptainHomeSummary['today'] }) {
  return (
    <View
      style={{
        flexDirection: 'row-reverse',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: BRAND.line,
        paddingVertical: 12,
      }}>
      <Stat value={formatMoney(today.earningsPiastres)} label="أرباح النهاردة" />
      <View style={{ width: 1, backgroundColor: BRAND.line }} />
      <Stat value={formatNumber(today.trips)} label="طلبات" />
      <View style={{ width: 1, backgroundColor: BRAND.line }} />
      <Stat value={today.rating == null ? '—' : formatRating(today.rating)} label="التقييم" />
    </View>
  );
}

export function HomeSheet({
  summary,
  blockers,
  warnings,
  online,
  backgroundActive,
  actionError,
  onRetryAction,
}: Props) {
  const { today } = summary;

  return (
    <View
      style={{
        backgroundColor: BRAND.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: BRAND.line,
        paddingHorizontal: 20,
        // leave room for the ring that overlaps the sheet's top edge
        paddingTop: RING_SIZE / 2 + 14,
        paddingBottom: 16,
        gap: 14,
      }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ color: BRAND.text, fontSize: 20, fontWeight: '700', lineHeight: 28 }}>
          {online ? 'أنت أونلاين' : 'أنت أوفلاين'}
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: 14, textAlign: 'center' }}>
          {online
            ? 'بنوصلك الطلبات القريبة منك'
            : `حقّقت ${formatMoney(today.earningsPiastres)} من ${formatMoney(today.goalPiastres)} النهاردة`}
        </Text>
      </View>

      {/* Today */}
      <TodayStats today={today} />

      {/* Demand hint (only while online) */}
      {online && summary.demandHint ? (
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} color={BRAND.teal} />
          <Text style={{ color: BRAND.text, fontSize: 15, flex: 1 }}>{summary.demandHint}</Text>
        </View>
      ) : null}

      {/* Background location notice */}
      {online && !backgroundActive ? (
        <Text style={{ color: BRAND.muted, fontSize: 13 }}>
          التطبيق بيستقبل الطلبات وهو مفتوح بس. فعّل الموقع &quot;دايمًا&quot; عشان توصلك الطلبات
          والشاشة مقفولة.
        </Text>
      ) : null}

      {/* Reasons he cannot go online, each with a fix */}
      {!online &&
        blockers.map((b) => (
          <View
            key={b.key}
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 10,
              backgroundColor: BRAND.surface,
              borderRadius: 12,
              padding: 12,
            }}>
            <CircleAlert size={22} color={BRAND.danger} />
            <Text style={{ color: BRAND.text, fontSize: 14, flex: 1 }}>{b.message}</Text>
            {b.onFix && b.fixLabel ? (
              <Pressable
                onPress={b.onFix}
                accessibilityRole="button"
                accessibilityLabel={b.fixLabel}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: BRAND.dark,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: BRAND.onPrimary, fontSize: 14, fontWeight: '700' }}>
                  {b.fixLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ))}

      <WarningList warnings={warnings} />

      {/* Failed to go online/offline */}
      {actionError ? (
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: BRAND.danger, fontSize: 14, flex: 1 }}>{actionError}</Text>
          <Pressable
            onPress={onRetryAction}
            accessibilityRole="button"
            accessibilityLabel="أعد المحاولة"
            style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}>
            <Text style={{ color: BRAND.primary, fontSize: 14, fontWeight: '700' }}>
              أعد المحاولة
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

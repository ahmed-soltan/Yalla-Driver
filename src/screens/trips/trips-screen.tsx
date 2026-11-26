// src/screens/trips/trips-screen.tsx
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { OrderHistoryFilter, OrderHistoryItem } from '@/entities/order/model/order-types';
import { useTripHistory } from '@/features/trips/services/use-trip-history';
import { TripCard } from '@/features/trips/ui/trip-card';
import { TripFilter } from '@/features/trips/ui/trip-filters';
import { TAB_BAR_CLEARANCE } from '@/shared/config/tab-bar';

const EMPTY_TEXT: Record<OrderHistoryFilter, string> = {
  ALL: 'لسه معندكش رحلات. أول ما تخلّص طلب هتلاقيه هنا.',
  COMPLETED: 'مفيش رحلات مكتملة لحد دلوقتي.',
  CANCELLED: 'مفيش رحلات ملغية. كمّل كده!',
};

export function TripsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<OrderHistoryFilter>('ALL');
  const query = useTripHistory(filter);

  const items = useMemo<OrderHistoryItem[]>(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  );

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query]);

  const header = (
    <View style={{ gap: 16, paddingBottom: 4 }}>
      <Text
        style={{
          color: BRAND.text,
          fontSize: 26,
          fontWeight: '700',
          lineHeight: 32,
        }}>
        الرحلات
      </Text>
      <TripFilter value={filter} onChange={setFilter} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.surface }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <TripCard item={item} />}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: TAB_BAR_CLEARANCE + insets.bottom + 16,
          gap: 12,
          flexGrow: 1,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListEmptyComponent={
          query.isLoading ? (
            <View style={{ paddingVertical: 64 }} accessibilityLabel="جاري التحميل">
              <ActivityIndicator color={BRAND.primary} />
            </View>
          ) : query.isError ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48 }}>
              <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
                ما قدرناش نحمّل رحلاتك
              </Text>
              <Text style={{ color: BRAND.muted, fontSize: 14, textAlign: 'center' }}>
                اتأكد من النت واضغط أعد المحاولة.
              </Text>
              <Pressable
                onPress={() => query.refetch()}
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
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 64 }}>
              <Inbox size={40} color={BRAND.muted} />
              <Text style={{ color: BRAND.muted, fontSize: 15, textAlign: 'center' }}>
                {EMPTY_TEXT[filter]}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator color={BRAND.primary} style={{ paddingVertical: 16 }} />
          ) : null
        }
      />
    </View>
  );
}
